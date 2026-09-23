import logging
from typing import Dict, Any, List, Optional
import numpy as np
import joblib

from app.core.config import settings
from app.core.mudras_data import MUDRAS_CATALOG
from app.ml.features import extract_features

logger = logging.getLogger("kuchipudi.ml.predictor")

class MudraPredictor:
    def __init__(self):
        self.artifact: Optional[Dict[str, Any]] = None
        self.pipeline = None
        self.classes: List[str] = []
        self.load_model()

    def load_model(self) -> bool:
        """Loads or reloads the trained model from disk."""
        if not settings.MODEL_PATH.exists():
            logger.warning(f"No trained model found at {settings.MODEL_PATH}.")
            self.artifact = None
            self.pipeline = None
            self.classes = []
            return False

        try:
            self.artifact = joblib.load(settings.MODEL_PATH)
            self.pipeline = self.artifact.get("pipeline")
            self.classes = self.artifact.get("classes", [])
            logger.info(f"Loaded classifier ({self.artifact.get('algorithm')}) with {len(self.classes)} classes.")
            return True
        except Exception as e:
            logger.error(f"Failed to load model from {settings.MODEL_PATH}: {e}")
            return False

    def is_ready(self) -> bool:
        return self.pipeline is not None and len(self.classes) > 0

    def predict(
        self,
        features: Optional[List[float]] = None,
        landmarks: Optional[List[Any]] = None,
        handedness: str = "Right",
        threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Classifies hand features or landmarks.
        Returns predicted mudra, confidence, all class probabilities, and catalog metadata.
        """
        if not self.is_ready():
            # Try reloading once in case a new model was trained
            if not self.load_model():
                return {
                    "mudra": "Model Not Ready",
                    "confidence": 0.0,
                    "all_probabilities": {},
                    "is_valid": False,
                    "sanskrit": None,
                    "meaning": "Please train or seed the model first.",
                    "color": "#64748b",
                    "icon": "help-circle",
                    "pose_guidance": "Model training needed."
                }

        # 1. Feature extraction if raw landmarks supplied
        if features is None or len(features) != 33:
            if landmarks is not None and len(landmarks) == 21:
                features = extract_features(landmarks, handedness=handedness)
            else:
                raise ValueError("Either 33 valid features or 21 landmarks must be provided.")

        X = np.array([features], dtype=np.float32)

        # 2. Probability estimation
        if hasattr(self.pipeline, "predict_proba"):
            probs = self.pipeline.predict_proba(X)[0]
            prob_dict = {cls_name: float(p) for cls_name, p in zip(self.classes, probs)}
            best_idx = int(np.argmax(probs))
            predicted_class = self.classes[best_idx]
            confidence = float(probs[best_idx])
        else:
            predicted_class = str(self.pipeline.predict(X)[0])
            confidence = 1.0
            prob_dict = {predicted_class: 1.0}

        min_conf = threshold if threshold is not None else settings.CONFIDENCE_THRESHOLD
        is_valid = confidence >= min_conf

        # 3. Retrieve mudra catalog details
        catalog_entry = MUDRAS_CATALOG.get(predicted_class, {})

        if not is_valid:
            return {
                "mudra": "No Clear Mudra",
                "confidence": round(confidence, 4),
                "all_probabilities": {k: round(v, 4) for k, v in prob_dict.items()},
                "is_valid": False,
                "sanskrit": "अस्पष्ट",
                "meaning": "Adjust your hand posture to match the mudra",
                "color": "#64748b",
                "icon": "hand",
                "pose_guidance": catalog_entry.get("pose_guidance", "Hold your hand steady facing camera.")
            }

        return {
            "mudra": predicted_class,
            "confidence": round(confidence, 4),
            "all_probabilities": {k: round(v, 4) for k, v in prob_dict.items()},
            "is_valid": True,
            "sanskrit": catalog_entry.get("sanskrit"),
            "meaning": catalog_entry.get("meaning"),
            "color": catalog_entry.get("color", "#38bdf8"),
            "icon": catalog_entry.get("icon", "sparkles"),
            "pose_guidance": catalog_entry.get("pose_guidance")
        }

predictor = MudraPredictor()
