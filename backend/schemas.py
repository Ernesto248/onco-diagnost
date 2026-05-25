from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class DatasetOut(BaseModel):
    id: int
    name: str
    rows: Optional[int] = None
    features: Optional[int] = None
    minority_class: Optional[str] = None
    minority_count: Optional[int] = None
    majority_count: Optional[int] = None
    imbalance_ratio: Optional[float] = None
    is_balanced: bool = False
    created_at: Optional[str] = None

class DatasetUploadOut(BaseModel):
    id: int
    name: str
    rows: int
    features: int
    minority_class: str
    minority_count: int
    majority_count: int
    imbalance_ratio: float

class BalanceRequest(BaseModel):
    dataset_id: int

class BalanceOut(BaseModel):
    balanced_id: int
    name: str
    rows: int
    imbalance_ratio: float
    synthetic_added: int

class TrainRequest(BaseModel):
    dataset_id: int
    classifier: str = Field(..., pattern="^(knn|mlp|c4\.5)$")
    balanced_by: str = "smote-cov"

class TrainOut(BaseModel):
    model_id: int
    name: str
    classifier_type: str
    auc: float
    f1_score: float

class ClassifyRequest(BaseModel):
    model_id: int
    patient_data: Dict[str, Any]

class ClassifyOut(BaseModel):
    prediction: str
    confidence: float
    predicted_class: str
    all_probabilities: Dict[str, float]

class ModelOut(BaseModel):
    id: int
    name: str
    dataset_id: int
    classifier_type: str
    balanced_by: str
    auc: Optional[float] = None
    f1_score: Optional[float] = None
    features: Optional[List[str]] = None
    classes: Optional[List[str]] = None
    created_at: Optional[str] = None

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
