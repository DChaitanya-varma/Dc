from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import logging

from app.models.schemas import SampleCreate, SampleResponse, SamplesStatsResponse
from app.db.mongo import db_manager
from app.ml.features import extract_features
from app.ml.seed_data import generate_seed_dataset
from app.core.mudras_data import TARGET_MUDRA_NAMES

logger = logging.getLogger("kuchipudi.api.samples")
router = APIRouter()

@router.post("", response_model=Dict[str, Any])
async def create_sample(sample_in: SampleCreate):
    """
    Saves a labeled landmark sample during data collection.
    Automatically computes 33 invariant features from 21 landmarks if features not pre-computed.
    """
    # Verify mudra is known or valid
    mudra_name = sample_in.mudra.strip()

    # Compute features if not already provided
    features = sample_in.features
    if features is None or len(features) != 33:
        if not sample_in.landmarks or len(sample_in.landmarks) != 21:
            raise HTTPException(
                status_code=400,
                detail="Either 33 pre-computed features or 21 3D landmarks must be provided."
            )
        try:
            features = extract_features(sample_in.landmarks, handedness=sample_in.handedness or "Right")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Feature extraction failed: {str(e)}")

    sample_doc = {
        "mudra": mudra_name,
        "features": features,
        "landmarks": [lm.dict() for lm in sample_in.landmarks] if sample_in.landmarks else None,
        "handedness": sample_in.handedness or "Right",
        "session_id": sample_in.session_id
    }

    saved = await db_manager.save_sample(sample_doc)
    return {
        "status": "success",
        "id": saved["id"],
        "mudra": saved["mudra"],
        "feature_dim": len(saved["features"]),
        "created_at": saved["created_at"]
    }

@router.get("", response_model=List[Dict[str, Any]])
async def list_samples(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    mudra: Optional[str] = None
):
    """Retrieve samples with optional filtering by mudra."""
    return await db_manager.get_samples(skip=skip, limit=limit, mudra=mudra)

@router.get("/stats", response_model=SamplesStatsResponse)
async def get_samples_stats():
    """
    Returns data collection stats: counts per mudra, class balance checks,
    and storage mode (MongoDB vs Local JSON).
    """
    counts = await db_manager.get_counts_by_mudra()
    total = sum(counts.values())

    # Ensure all target mudras are represented in counts
    for m in TARGET_MUDRA_NAMES:
        counts.setdefault(m, 0)

    # Class balance check: warn if any active class has < 15 samples
    recommended_min = 30
    is_balanced = total > 0 and all(c >= 15 for c in counts.values())

    return {
        "total_samples": total,
        "counts_by_mudra": counts,
        "recommended_min_per_class": recommended_min,
        "is_balanced": is_balanced,
        "storage_mode": db_manager.get_storage_mode()
    }

@router.delete("/{sample_id}")
async def delete_sample(sample_id: str):
    """Delete a single recorded sample."""
    deleted = await db_manager.delete_sample(sample_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Sample not found")
    return {"status": "success", "deleted_id": sample_id}

@router.delete("")
async def clear_all_samples():
    """Clears all training samples (used for full reset)."""
    count = await db_manager.clear_samples()
    return {"status": "success", "cleared_count": count}

@router.post("/seed")
async def seed_samples(samples_per_mudra: int = Query(35, ge=10, le=100)):
    """Populate dataset with canonical synthetic samples for all 8 mudras."""
    seed_data = generate_seed_dataset(samples_per_mudra=samples_per_mudra)
    for s in seed_data:
        await db_manager.save_sample(s)
    return {
        "status": "success",
        "message": f"Added {len(seed_data)} seed samples across {len(TARGET_MUDRA_NAMES)} mudras.",
        "sample_count": len(seed_data)
    }
