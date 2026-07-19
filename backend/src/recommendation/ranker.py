"""Score the candidate frame with the LightGBM ranker and assemble the final feed.

Mirrors the notebook serving flow (cell 9):
  scale -> predict -> min-max normalize -> blend with similarity -> tiered slots.

Final feed = N_FOLLOWED_SLOTS (chronological, bypass ranker)
           + exploit slots (Boltzmann/softmax-sampled by final_score)
           + N_EXPLORE_SLOTS (Thompson sampling)
           + backfill (best remaining by final_score) if any tier came up short.
"""

import math

import numpy as np
import pandas as pd

from ml import constants as C
from ml.loader import models
from .thompson import Candidate, pick_explore


def _minmax(values: np.ndarray) -> np.ndarray:
    lo, hi = float(values.min()), float(values.max())
    if hi > lo:
        return (values - lo) / (hi - lo)
    return np.full(values.shape, 0.5)


def _score(df: pd.DataFrame) -> pd.DataFrame:
    raw_topic = df["topic_similarity"].clip(0, 1).fillna(0).to_numpy()
    raw_tag = df["tag_similarity"].clip(0, 1).fillna(0).to_numpy()

    # Scale the RobustScaler subset in place, then predict on the full feature set.
    scaled = df[C.FEATURES_ALL].copy()
    scaled[C.SCALE_FEATURES] = models.scaler.transform(scaled[C.SCALE_FEATURES])
    raw_scores = models.ranker.predict(scaled[C.FEATURES_ALL].fillna(0))

    predicted = _minmax(np.asarray(raw_scores, dtype=float))
    combined = np.maximum(_minmax(raw_topic), _minmax(raw_tag))

    df = df.copy()
    df["predicted_score"] = predicted
    df["final_score"] = (
        predicted * (1 - C.TOPIC_BOOST_WEIGHT) + combined * C.TOPIC_BOOST_WEIGHT
    )
    return df


def _cap_diversity(df: pd.DataFrame, n_slots: int) -> pd.DataFrame:
    """Greedy pass (final_score order) enforcing max content-type share and a cap on
    distinct topics, so the exploit pool can't collapse to one type/topic."""
    max_per_type = max(1, math.ceil(n_slots * C.MAX_TYPE_SHARE))
    type_counts: dict[str, int] = {}
    seen_topics: set = set()
    keep = []
    for idx, row in df.iterrows():
        ctype, topic = row["content_type"], row["topic"]
        if type_counts.get(ctype, 0) >= max_per_type:
            continue
        if topic not in seen_topics and len(seen_topics) >= C.MAX_DISTINCT_TOPICS:
            continue
        keep.append(idx)
        type_counts[ctype] = type_counts.get(ctype, 0) + 1
        seen_topics.add(topic)
    return df.loc[keep]


def assemble_feed(df: pd.DataFrame, n_ranked: int = C.N_RANKED) -> list[dict]:
    """Return an ordered list of {post_id, source} for the feed."""
    if df.empty or models.ranker is None or models.scaler is None:
        return []

    df = _score(df).reset_index(drop=True)
    picked: list[dict] = []
    used: set = set()

    # 1. Followed-creator slots (chronological, guaranteed, bypass ranker)
    followed = df[df["followed"]].sort_values("published_at", ascending=False)
    for _, row in followed.head(C.N_FOLLOWED_SLOTS).iterrows():
        picked.append({"post_id": row["post_id"], "source": "followed_creator"})
        used.add(row["post_id"])

    # 2. Exploit slots — softmax-sampled from the diversity-capped remaining pool
    remaining = df[~df["post_id"].isin(used)]
    exploit_pool = _cap_diversity(remaining, n_ranked)
    target_exploit = max(0, n_ranked - len(picked) - C.N_EXPLORE_SLOTS)
    if target_exploit and not exploit_pool.empty:
        weights = np.exp(exploit_pool["final_score"].to_numpy() / C.TEMPERATURE)
        weights /= weights.sum()
        k = min(target_exploit, len(exploit_pool))
        chosen = np.random.choice(exploit_pool.index, size=k, replace=False, p=weights)
        for idx in chosen:
            row = exploit_pool.loc[idx]
            picked.append({"post_id": row["post_id"], "source": "ranked"})
            used.add(row["post_id"])

    # 3. Explore slots — Thompson sampling over the still-unused candidates
    explore_pool = df[~df["post_id"].isin(used)]
    if not explore_pool.empty and C.N_EXPLORE_SLOTS > 0:
        by_ext = {int(r["ext_id"]): r["post_id"] for _, r in explore_pool.iterrows() if r["ext_id"] is not None}
        cands = [
            Candidate(ext_id=int(r["ext_id"]), upvotes=int(r["upvotes"]), downvotes=int(r["downvotes"]))
            for _, r in explore_pool.iterrows()
            if r["ext_id"] is not None
        ]
        for ext_id in pick_explore(cands, C.N_EXPLORE_SLOTS):
            pid = by_ext.get(ext_id)
            if pid is not None and pid not in used:
                picked.append({"post_id": pid, "source": "explore_thompson"})
                used.add(pid)

    # 4. Backfill from best remaining by final_score
    if len(picked) < n_ranked:
        backfill = df[~df["post_id"].isin(used)].sort_values("final_score", ascending=False)
        for _, row in backfill.head(n_ranked - len(picked)).iterrows():
            picked.append({"post_id": row["post_id"], "source": "backfill"})
            used.add(row["post_id"])

    return picked[:n_ranked]
