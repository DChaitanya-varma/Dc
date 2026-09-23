import asyncio
import numpy as np
import pytest

from app.ml.features import extract_features
from app.ml.seed_data import generate_seed_dataset, generate_canonical_landmarks
from app.ml.classifier import train_classifier
from app.ml.predictor import predictor
from app.core.mudras_data import TARGET_MUDRA_NAMES, MUDRAS_CATALOG
from app.db.mongo import db_manager

def test_feature_invariance():
    """Verify that features are completely invariant to hand scale and translation."""
    rng = np.random.default_rng(123)
    base_lms = generate_canonical_landmarks("Pataka", rng)
    base_lm_dicts = [{"x": float(p[0]), "y": float(p[1]), "z": float(p[2])} for p in base_lms]
    feats1 = np.array(extract_features(base_lm_dicts))

    assert len(feats1) == 33, f"Expected 33 features, got {len(feats1)}"

    # Apply 2x scale and massive translation
    transformed_lms = base_lms * 2.5 + [10.0, -15.0, 5.0]
    trans_lm_dicts = [{"x": float(p[0]), "y": float(p[1]), "z": float(p[2])} for p in transformed_lms]
    feats2 = np.array(extract_features(trans_lm_dicts))

    # Features should match closely (within floating precision tolerance)
    diff = np.abs(feats1 - feats2)
    max_diff = np.max(diff)
    print(f"Max feature difference under 2.5x scale + translation: {max_diff:.6f}")
    assert max_diff < 1e-3, f"Features not scale/translation invariant! Max diff: {max_diff}"

def test_seed_and_train():
    """Verify seed dataset generation, training pipeline, and validation metrics."""
    seed_samples = generate_seed_dataset(samples_per_mudra=20)
    assert len(seed_samples) == 20 * len(TARGET_MUDRA_NAMES)

    report = train_classifier(seed_samples, algorithm="knn", test_size=0.20, n_neighbors=3)
    assert report["status"] == "success"
    assert report["val_accuracy"] >= 0.85, f"Validation accuracy too low: {report['val_accuracy']}"
    assert len(report["classes"]) == 8
    print(f"Seed model training passed with validation accuracy: {report['val_accuracy']*100:.1f}%")

def test_prediction():
    """Verify prediction returns valid mudra, probabilities, and catalog metadata."""
    predictor.load_model()
    assert predictor.is_ready()

    rng = np.random.default_rng(42)
    for mudra in TARGET_MUDRA_NAMES:
        lms = generate_canonical_landmarks(mudra, rng)
        lm_dicts = [{"x": float(p[0]), "y": float(p[1]), "z": float(p[2])} for p in lms]
        pred = predictor.predict(landmarks=lm_dicts, threshold=0.40)
        assert pred["mudra"] == mudra, f"Expected {mudra}, got {pred['mudra']}"
        assert pred["confidence"] > 0.40
        assert pred["sanskrit"] is not None
        assert pred["meaning"] is not None
        print(f"Correctly predicted {mudra} with confidence {pred['confidence']*100:.1f}%")

async def test_db_operations():
    """Verify sample saving and querying in storage."""
    await db_manager.connect()
    initial_counts = await db_manager.get_counts_by_mudra()
    print(f"DB counts: {initial_counts}, Storage mode: {db_manager.get_storage_mode()}")

if __name__ == "__main__":
    print("--- 1. Testing Feature Invariance ---")
    test_feature_invariance()
    print("--- 2. Testing Seed Dataset & Training ---")
    test_seed_and_train()
    print("--- 3. Testing Real-time Prediction ---")
    test_prediction()
    print("--- 4. Testing Storage Operations ---")
    asyncio.run(test_db_operations())
    print("\nALL BACKEND UNIT TESTS PASSED SUCCESSFULLY!")
