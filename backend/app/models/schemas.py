from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float

class SampleCreate(BaseModel):
    mudra: str = Field(..., description="Target mudra name (e.g. Pataka)")
    landmarks: Optional[List[LandmarkPoint]] = Field(None, description="21 3D hand landmarks from MediaPipe")
    features: Optional[List[float]] = Field(None, description="Pre-computed 33 geometric features")
    handedness: Optional[str] = Field("Right", description="Right or Left hand")
    session_id: Optional[str] = Field(None, description="Optional batch/session identifier")

class SampleResponse(BaseModel):
    id: str
    mudra: str
    features: List[float]
    handedness: str
    created_at: str

class SamplesStatsResponse(BaseModel):
    total_samples: int
    counts_by_mudra: Dict[str, int]
    recommended_min_per_class: int
    is_balanced: bool
    storage_mode: str

class PredictRequest(BaseModel):
    landmarks: Optional[List[LandmarkPoint]] = Field(None, description="21 3D hand landmarks")
    features: Optional[List[float]] = Field(None, description="Pre-computed 33 geometric features")
    handedness: Optional[str] = Field("Right", description="Handedness (Right/Left)")

class PredictResponse(BaseModel):
    mudra: str
    confidence: float
    all_probabilities: Dict[str, float]
    is_valid: bool
    sanskrit: Optional[str] = None
    meaning: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    pose_guidance: Optional[str] = None

class TrainRequest(BaseModel):
    algorithm: Optional[str] = Field("knn", description="'knn' or 'svm'")
    test_size: Optional[float] = Field(0.20, description="Test/validation split ratio (e.g. 0.20 for 20%)")
    n_neighbors: Optional[int] = Field(5, description="KNN k-neighbors parameter")

class TrainResponse(BaseModel):
    status: str
    algorithm: str
    total_samples: int
    classes: List[str]
    train_accuracy: float
    val_accuracy: float
    report: Dict[str, Any]
    confusion_matrix: List[List[int]]
    confusion_labels: List[str]
    trained_at: str

class ModelInfoResponse(BaseModel):
    is_trained: bool
    algorithm: Optional[str] = None
    classes: List[str] = []
    val_accuracy: Optional[float] = None
    sample_count: int = 0
    trained_at: Optional[str] = None
    confidence_threshold: float
