import joblib

from core.config import get_settings

settings = get_settings()


class ModelContainer:
    def __init__(self):
        self.ranker = None
        self.tfidf = None
        self.als = None
        self.is_loaded = False

    def load(self):
        if self.is_loaded:
            return

        models_dir = settings.ML_MODELS_PATH
        data_dir = settings.ML_DATA_PATH

        print(f"📂 Loading models from {models_dir}...")

        # Load Ranker
        ranker_path = models_dir / "knova_content_ranker.pkl"
        if ranker_path.exists():
            self.ranker = joblib.load(ranker_path)
            print("✅ Loaded Content Ranker")

        # Load TF-IDF
        tfidf_path = models_dir / "knova_tfidf.pkl"
        matrix_path = models_dir / "knova_tfidf_matrix.pkl"
        ids_path = models_dir / "knova_content_ids.pkl"

        if tfidf_path.exists() and matrix_path.exists():
            self.tfidf = {
                'vectorizer': joblib.load(tfidf_path),
                'matrix': joblib.load(matrix_path),
                'ids': joblib.load(ids_path)
            }
            print("✅ Loaded TF-IDF")

        # Load ALS
        als_path = models_dir / "knova_als.pkl"
        if als_path.exists():
            self.als = joblib.load(als_path)
            print("✅ Loaded ALS")

        self.is_loaded = True


models = ModelContainer()
