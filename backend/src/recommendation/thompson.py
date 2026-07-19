"""Thompson sampling for the exploration slots of the feed.

The trained knova_thompson_sampler.pkl can't be unpickled outside the notebook
(its class lived in __main__), and it would be stale anyway. Instead we rebuild the
Beta posterior directly from the live denormalized Post counters, which is exactly
what the notebook's ThompsonSampler.fit did (alpha = 1 + upvotes, beta = 1 + downvotes),
but always fresh.
"""

from dataclasses import dataclass

import numpy as np

PRIOR_ALPHA = 1.0
PRIOR_BETA = 1.0


@dataclass
class Candidate:
    """Minimal view of a post the sampler needs."""
    ext_id: int
    upvotes: int
    downvotes: int


def pick_explore(
    candidates: list[Candidate],
    n: int,
    exclude_ids: set[int] | None = None,
) -> list[int]:
    """Draw one Beta(1+upvotes, 1+downvotes) sample per eligible candidate and return
    the ext_ids of the top-n draws. High-uncertainty (few votes) items can win here,
    which is the exploration behaviour we want."""
    if n <= 0:
        return []
    exclude_ids = exclude_ids or set()
    eligible = [c for c in candidates if c.ext_id not in exclude_ids]
    if not eligible:
        return []

    alpha = np.array([PRIOR_ALPHA + max(0, c.upvotes) for c in eligible], dtype=float)
    beta = np.array([PRIOR_BETA + max(0, c.downvotes) for c in eligible], dtype=float)
    scores = np.random.beta(alpha, beta)

    order = np.argsort(scores)[::-1][:n]
    return [eligible[i].ext_id for i in order]
