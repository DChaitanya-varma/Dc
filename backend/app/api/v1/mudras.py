from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.core.mudras_data import MUDRAS_LIST, MUDRAS_CATALOG

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def get_all_mudras():
    """Retrieve full catalog of Kuchipudi mudras with descriptions and guides."""
    return MUDRAS_LIST

@router.get("/{name_or_id}")
async def get_mudra(name_or_id: str):
    """Retrieve a single mudra by name or identifier."""
    # Look up by name or id
    for item in MUDRAS_LIST:
        if item["id"].lower() == name_or_id.lower() or item["name"].lower() == name_or_id.lower():
            return item
    raise HTTPException(status_code=404, detail=f"Mudra '{name_or_id}' not found in catalog")
