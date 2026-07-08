# Configurations for the knova-backend

from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

settings = None

# Points to the backend/ directory (this file lives in backend/core/)
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    DEBUG: bool = True

    DATABASE_URL: str = ""
    REDIS_URL: str = ""

    SECRET_KEY: str = "insecure-SpJAPDzPloydQoB8IxprCO-yvjrnGBDE-RMA"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES:  int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 24 * 60

    ALLOW_ORIGINS: list[str] = ["*"]

    # ML model artifacts (overridable via ML_MODELS_PATH / ML_DATA_PATH env vars)
    ML_MODELS_PATH: Path = BASE_DIR / "models"
    ML_DATA_PATH: Path = BASE_DIR / "data"


@lru_cache
def get_settings():
    global settings
    if settings is None:
        settings = Settings()
    return settings