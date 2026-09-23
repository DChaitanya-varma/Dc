import os
from pathlib import Path
from typing import List

# Base directory for backend
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "Kuchipudi Mudra Recognizer"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "kuchipudi_db")
    
    # Local fallback file when MongoDB is unreachable
    DATA_DIR: Path = BASE_DIR / "data"
    MODELS_DIR: Path = BASE_DIR / "models"
    FALLBACK_DATA_FILE: Path = DATA_DIR / "samples.json"
    MODEL_PATH: Path = MODELS_DIR / "kuchipudi_classifier.joblib"
    
    # Model configuration
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))
    DEFAULT_ALGORITHM: str = os.getenv("DEFAULT_ALGORITHM", "knn")  # "knn" or "svm"
    KNN_NEIGHBORS: int = int(os.getenv("KNN_NEIGHBORS", "5"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
