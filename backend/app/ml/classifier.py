import logging
from datetime import datetime
from typing import List, Dict, Any, Tuple
from pathlib import Path

import numpy as np
import joblib
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from app.core.config import settings

logger = logging.getLogger("kuchipudi.ml.classifier")

def train_classifier(
    samples: List[Dict[str, Any]],
    algorithm: str = "knn",
    test_size: float = 0.20,
    n_neighbors: int = 5
) -> Dict[str, Any]:
    """
    Trains a scikit-learn classifier pipeline on engineered geometric features.
    Enforces a strict held-out validation split and generates detailed metrics.
    """
    if len(samples) < 10:
        raise ValueError(f"Need at least 10 samples to train. Found {len(samples)}.")

    X_list = []
    y_list = []

    for s in samples:
        feats = s.get("features")
        mudra = s.get("mudra")
        if feats and mudra and len(feats) == 33:
            X_list.append(feats)
            y_list.append(mudra)

    if len(X_list) < 10:
        raise ValueError(f"Only {len(X_list)} valid 33-dim feature vectors found in {len(samples)} samples.")

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list)

    unique_classes, counts = np.unique(y, return_counts=True)
    if len(unique_classes) < 2:
        raise ValueError(f"Need at least 2 distinct mudra classes to train. Found {len(unique_classes)}: {unique_classes}")

    # Use stratification if all classes have at least 2 samples
    stratify = y if np.all(counts >= 2) else None

    # Enforce train/test validation split
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=stratify
    )

    # Setup pipeline
    if algorithm.lower() == "svm":
        clf = SVC(kernel="rbf", probability=True, C=10.0, gamma="scale", random_state=42)
    else:
        # Default KNN with distance weighting
        k = min(n_neighbors, len(X_train))
        clf = KNeighborsClassifier(n_neighbors=k, weights="distance", metric="minkowski", p=2)

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", clf)
    ])

    # Fit pipeline
    pipeline.fit(X_train, y_train)

    # Predictions
    y_train_pred = pipeline.predict(X_train)
    y_val_pred = pipeline.predict(X_val)

    train_acc = float(accuracy_score(y_train, y_train_pred))
    val_acc = float(accuracy_score(y_val, y_val_pred))

    classes_list = sorted(list(unique_classes))
    report = classification_report(y_val, y_val_pred, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_val, y_val_pred, labels=classes_list).tolist()

    trained_at = datetime.utcnow().isoformat()

    artifact = {
        "pipeline": pipeline,
        "classes": classes_list,
        "algorithm": algorithm.lower(),
        "train_accuracy": train_acc,
        "val_accuracy": val_acc,
        "sample_count": len(X),
        "report": report,
        "confusion_matrix": cm,
        "confusion_labels": classes_list,
        "trained_at": trained_at,
        "feature_dim": 33
    }

    # Save to disk
    settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, settings.MODEL_PATH)
    logger.info(f"Model saved to {settings.MODEL_PATH} (val_acc={val_acc:.4f})")

    return {
        "status": "success",
        "algorithm": algorithm.lower(),
        "total_samples": len(X),
        "classes": classes_list,
        "train_accuracy": round(train_acc, 4),
        "val_accuracy": round(val_acc, 4),
        "report": report,
        "confusion_matrix": cm,
        "confusion_labels": classes_list,
        "trained_at": trained_at
    }
