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


class DetectionObject(BaseModel):
    class_id: int = Field(..., description="Predicted class ID")
    class_name: str = Field(..., description="Human-readable class name")
    confidence: float = Field(
        ..., ge=0, le=1, description="Confidence score between 0 and 1"
    )
    box: List[float] = Field(..., description="Bounding box coordinates")


class DetectionResult(PredictionResult):
    """Schema for prediction result"""

    predictions: List[DetectionObject] = Field(
        ...,
        description="List of predicted (class_id, class_name, confidence) tuples",
    )


class SegmentationObject(BaseModel):
    class_id: int = Field(..., description="Predicted class ID")
    class_name: str = Field(..., description="Human-readable class name")
    polygon: List[List[float]] = Field(
        ..., description="Contour vertices [[x, y], ...]"
    )
    area: float = Field(..., description="Region area in pixels")
    confidence: Optional[float] = Field(
        None, ge=0, le=1, description="Mean class probability over the region"
    )


class SegmentationResult(PredictionResult):
    predictions: List[SegmentationObject] = Field(
        ..., description="List of segmented regions"
    )


class PredictionResponse(BaseModel):
    """Schema for prediction API response"""

    status: PredictionStatus
    error: Optional[str] = None
    result: (
        PredictionResult | ClassificationResult | DetectionResult | SegmentationResult
    ) = Field(..., description="Prediction result")
