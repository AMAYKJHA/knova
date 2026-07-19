"""Loads and holds the trained recommender artifacts in memory.

All artifacts are keyed by the ML integer ids (the `ext_id` bridge on User/Post/
CreatorProfile). The recommendation pipeline works in ext_id space and only maps
back to UUIDs at serialization time.
"""

import joblib
import numpy as np

from core.config import get_settings

settings = get_settings()


class ModelContainer:
    def __init__(self):
        self.ranker = None            # lightgbm LGBMRanker
        self.scaler = None            # sklearn RobustScaler (fit on SCALE_FEATURES)
        self.type_encoder = None      # sklearn LabelEncoder for content_type_enc

        # TF-IDF content retrieval
        self.tfidf = None             # TfidfVectorizer
        self.tfidf_matrix = None      # sparse (n_content, vocab)
        self.content_id_to_idx = {}   # ext content_id -> row in tfidf_matrix

        # ALS collaborative filtering
        self.als = None               # implicit AlternatingLeastSquares
        self.als_user_idx = {}        # ext user_id -> row in als.user_factors
        self.als_item_idx = {}        # ext content_id -> row in als.item_factors

        self.is_loaded = False

    def load(self):
        if self.is_loaded:
            return

        models_dir = settings.ML_MODELS_PATH
        print(f"Loading recommender artifacts from {models_dir}...")

        def _load(name):
            path = models_dir / name
            if not path.exists():
                print(f"Missing artifact: {name}")
                return None
            return joblib.load(path)

        # Ranker + preprocessing
        self.ranker = _load("knova_content_ranker.pkl")
        self.scaler = _load("knova_feature_scaler.pkl")
        self.type_encoder = _load("knova_type_encoder.pkl")

        # TF-IDF
        self.tfidf = _load("knova_tfidf.pkl")
        self.tfidf_matrix = _load("knova_tfidf_matrix.pkl")
        content_ids = _load("knova_content_ids.pkl")
        if content_ids is not None:
            self.content_id_to_idx = {
                int(cid): idx for idx, cid in enumerate(np.asarray(content_ids))
            }

        # ALS
        self.als = _load("knova_als.pkl")
        als_user_ids = _load("knova_als_user_ids.pkl")
        als_content_ids = _load("knova_als_content_ids.pkl")
        if als_user_ids is not None:
            self.als_user_idx = {
                int(uid): idx for idx, uid in enumerate(np.asarray(als_user_ids))
            }
        if als_content_ids is not None:
            self.als_item_idx = {
                int(cid): idx for idx, cid in enumerate(np.asarray(als_content_ids))
            }

        loaded = [
            n for n, o in [
                ("ranker", self.ranker), ("scaler", self.scaler),
                ("type_encoder", self.type_encoder), ("tfidf", self.tfidf),
                ("als", self.als),
            ] if o is not None
        ]
        print(f"Recommender artifacts loaded: {', '.join(loaded)}")
        self.is_loaded = True

    def als_score(self, user_ext_id: int | None, content_ext_id: int | None) -> float | None:
        """Real ALS dot product for a (user, content) pair, or None if either side
        is cold (not in the factor matrices) so the caller can fall back."""
        if self.als is None or user_ext_id is None or content_ext_id is None:
            return None
        u = self.als_user_idx.get(int(user_ext_id))
        c = self.als_item_idx.get(int(content_ext_id))
        if u is None or c is None:
            return None
        return float(self.als.user_factors[u] @ self.als.item_factors[c])


models = ModelContainer()
