import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class PredictionStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"


class PredictionRequest(BaseModel):
    """Schema for prediction request payload"""

    image: bytes = Field(..., description="Image data in bytes")
    model_id: str = Field(..., description="ID of the model to use")


class PredictionResult(BaseModel):
    """Schema for prediction result"""

    class_id: int = Field(..., description="Predicted class ID")
    class_name: str = Field(..., description="Human-readable class name")
    confidence: float = Field(
        ..., ge=0, le=1, description="Confidence score between 0 and 1"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional model-specific metadata"
    )


class PredictionResponse(BaseModel):
    """Schema for prediction API response"""

    status: PredictionStatus
    result: Optional[PredictionResult] = None
    error: Optional[str] = None
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    model_version: str
    inference_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.now)
