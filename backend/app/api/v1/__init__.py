from fastapi import APIRouter
from app.api.v1.mudras import router as mudras_router
from app.api.v1.samples import router as samples_router
from app.api.v1.train import router as train_router
from app.api.v1.predict import router as predict_router

api_v1_router = APIRouter()

api_v1_router.include_router(mudras_router, prefix="/mudras", tags=["Mudras Catalog"])
api_v1_router.include_router(samples_router, prefix="/samples", tags=["Samples & Data Collection"])
api_v1_router.include_router(train_router, prefix="/train", tags=["Model Training"])
api_v1_router.include_router(predict_router, prefix="/predict", tags=["Real-time Prediction"])
