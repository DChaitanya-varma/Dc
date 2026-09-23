from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

from app.models.schemas import TrainRequest, TrainResponse, ModelInfoResponse
from app.db.mongo import db_manager
from app.ml.classifier import train_classifier
from app.ml.predictor import predictor
from app.ml.seed_data import generate_seed_dataset
from app.core.config import settings

logger = logging.getLogger("kuchipudi.api.train")
router = APIRouter()

@router.post("", response_model=TrainResponse)
async def train_model_endpoint(req: TrainRequest = TrainRequest()):
    """
    Retrains the classifier on all recorded samples in the database.
    Enforces a strict 80/20 train/validation split to guard against overfitting.
    Returns full accuracy report, per-class precision/recall, and confusion matrix.
    """
    samples = await db_manager.get_all_samples()

    # If dataset has fewer than 16 samples, auto-seed canonical samples so model trains smoothly
    if len(samples) < 16:
        logger.info(f"Insufficient samples ({len(samples)}). Auto-seeding canonical dataset...")
        seed_data = generate_seed_dataset(samples_per_mudra=35)
        for s in seed_data:
            await db_manager.save_sample(s)
        samples = await db_manager.get_all_samples()

    try:
        report = train_classifier(
            samples=samples,
            algorithm=req.algorithm or settings.DEFAULT_ALGORITHM,
            test_size=req.test_size or 0.20,
            n_neighbors=req.n_neighbors or settings.KNN_NEIGHBORS
        )
        # Hot-reload model into live inference predictor
        predictor.load_model()
        return report
    except Exception as e:
        logger.exception("Training failed")
        raise HTTPException(status_code=400, detail=f"Training error: {str(e)}")

@router.get("/info", response_model=ModelInfoResponse)
async def get_model_info():
    """Returns current active model metadata, accuracy, and classes."""
    if not predictor.is_ready():
        return {
            "is_trained": False,
            "algorithm": None,
            "classes": [],
            "val_accuracy": None,
            "sample_count": 0,
            "trained_at": None,
            "confidence_threshold": settings.CONFIDENCE_THRESHOLD
        }

    artifact = predictor.artifact or {}
    return {
        "is_trained": True,
        "algorithm": artifact.get("algorithm", "knn"),
        "classes": artifact.get("classes", []),
        "val_accuracy": artifact.get("val_accuracy"),
        "sample_count": artifact.get("sample_count", 0),
        "trained_at": artifact.get("trained_at"),
        "confidence_threshold": settings.CONFIDENCE_THRESHOLD
    }
