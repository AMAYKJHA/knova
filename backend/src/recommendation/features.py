"""Feature construction for candidate posts.

For an unseen (user, post) pair most ranker features can't be reconstructed, so we
fill them with the training medians (as the notebook's _build_feature_rows does) and
compute live only the three signals we can:

  * als_score       — real ALS dot product (falls back to ALS_MEAN when cold)
  * topic_similarity— cosine between the user's interest TF-IDF vector and the post
  * tag_similarity  — Jaccard tag overlap between interest topics and the post's topic

Returns a DataFrame carrying the FEATURES_ALL columns plus per-candidate metadata the
ranker/assembly needs.
"""

import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from ml import constants as C
from ml.loader import models
from .retrieval import CandidateRow, UserContext


def _user_interest_vector(ctx: UserContext):
    """Build the user's TF-IDF vector the same way training did: each interest topic
    repeated round(weight*3) times. Returns None if there are no interests or TF-IDF
    isn't loaded."""
    if models.tfidf is None or not ctx.interest_weights:
        return None
    interest_str = " ".join(
        str(topic) * max(1, int(round(weight * C.INTEREST_WEIGHT_REPEAT)))
        for topic, weight in ctx.interest_weights
    )
    if not interest_str.strip():
        return None
    return models.tfidf.transform([interest_str])


def build_feature_frame(ctx: UserContext, candidates: list[CandidateRow]) -> pd.DataFrame:
    user_vec = _user_interest_vector(ctx)

    rows = []
    for cand in candidates:
        feat = dict(C.FEATURE_MEDIANS)

        # Collaborative filtering
        als = models.als_score(ctx.ext_id, cand.ext_id)
        feat["als_score"] = als if als is not None else C.ALS_MEAN

        # Content similarity (interest TF-IDF vs post)
        idx = models.content_id_to_idx.get(cand.ext_id) if cand.ext_id is not None else None
        if user_vec is not None and idx is not None and models.tfidf_matrix is not None:
            feat["topic_similarity"] = float(
                cosine_similarity(user_vec, models.tfidf_matrix[idx])[0][0]
            )
        else:
            feat["topic_similarity"] = 0.0

        # Tag adjacency
        feat["tag_similarity"] = C.tag_similarity(ctx.interest_topics, cand.topic)

        # metadata carried alongside the features for assembly
        feat["post_id"] = cand.post_id
        feat["ext_id"] = cand.ext_id
        feat["topic"] = cand.topic
        feat["content_type"] = cand.content_type
        feat["tier"] = cand.tier
        feat["followed"] = cand.followed
        feat["published_at"] = cand.published_at
        feat["upvotes"] = cand.upvotes
        feat["downvotes"] = cand.downvotes
        rows.append(feat)

    return pd.DataFrame(rows)
