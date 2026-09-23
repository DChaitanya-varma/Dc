import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.mongo import db_manager
from app.ml.predictor import predictor
from app.ml.seed_data import generate_seed_dataset
from app.ml.classifier import train_classifier
from app.api.v1 import api_v1_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("kuchipudi.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle startup and shutdown management."""
    logger.info("Initializing Kuchipudi Mudra Recognizer backend...")
    
    # 1. Connect to MongoDB (or initialize local fallback)
    await db_manager.connect()

    # 2. Check if model exists; if not, auto-seed dataset and train initial model
    if not settings.MODEL_PATH.exists():
        logger.info("No pre-existing model found. Generating canonical seed dataset for instant readiness...")
        seed_samples = generate_seed_dataset(samples_per_mudra=35)
        # Store seed samples in DB
        for s in seed_samples:
            await db_manager.save_sample(s)
        
        # Train initial classifier
        logger.info(f"Training initial classifier on {len(seed_samples)} seed samples...")
        train_classifier(seed_samples, algorithm="knn", test_size=0.20, n_neighbors=5)
    
    # 3. Load model into predictor
    predictor.load_model()
    logger.info("Backend startup complete. System ready for inference and training.")

    yield

    logger.info("Shutting down backend...")
    await db_manager.disconnect()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real-time Kuchipudi Mudra Recognition and Data-Collection API",
    lifespan=lifespan
)

# Enable CORS for frontend Vite development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "storage_mode": db_manager.get_storage_mode(),
        "model_ready": predictor.is_ready()
    }

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "storage_mode": db_manager.get_storage_mode(),
        "is_model_ready": predictor.is_ready(),
        "active_classes": predictor.classes
    }
