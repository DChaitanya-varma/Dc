from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

from app.models.schemas import PredictRequest, PredictResponse
from app.ml.predictor import predictor

logger = logging.getLogger("kuchipudi.api.predict")
router = APIRouter()

@router.post("", response_model=PredictResponse)
async def predict_mudra(req: PredictRequest):
    """
    Classifies a single frame's hand gesture from 21 MediaPipe landmarks or 33 geometric features.
    Returns predicted mudra name, confidence score, all class probabilities, and Sanskrit guidance.
    """
    try:
        result = predictor.predict(
            features=req.features,
            landmarks=req.landmarks,
            handedness=req.handedness or "Right"
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
