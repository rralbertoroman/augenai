from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, Field


class PredictionStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"


class PredictionRequest(BaseModel):
    """Schema for prediction request payload"""

    image: bytes = Field(..., description="Image data in bytes")
    model_id: str = Field(..., description="ID of the model to use")


class PredictionMetadata(BaseModel):
    inference_time_ms: float
    model_version: str


class PredictionResult(BaseModel):
    metadata: PredictionMetadata = Field(..., description="Metadata")


class ClassificationObject(BaseModel):
    class_id: int = Field(..., description="Predicted class ID")
    class_name: str = Field(..., description="Human-readable class name")
    confidence: float = Field(
        ..., ge=0, le=1, description="Confidence score between 0 and 1"
    )


class ClassificationResult(PredictionResult):
    """Schema for prediction result"""

    predictions: List[ClassificationObject] = Field(
        ...,
        description="List of predicted (class_id, class_name, confidence) tuples",
    )


class PredictionResponse(BaseModel):
    """Schema for prediction API response"""

    status: PredictionStatus
    error: Optional[str] = None
    result: PredictionResult = Field(..., description="Prediction result")
