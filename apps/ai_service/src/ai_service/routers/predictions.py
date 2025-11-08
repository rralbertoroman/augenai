"""AI predictions endpoints"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
import uuid

from ..utils.model_handler import model_handler
from ..auth.auth import verify_api_key

router = APIRouter(tags=["predictions"])


# Request/Response models
class PredictionRequest(BaseModel):
    model_id: str


class PredictionResponse(BaseModel):
    prediction_id: str
    model_id: str
    result: Dict[str, Any]
    confidence: float
    status: str = "completed"


@router.post("/predict", response_model=PredictionResponse)
async def predict(
    model_id: str = Form(..., description="ID of the model to use for prediction"),
    image: UploadFile = File(..., description="Image file to analyze"),
    api_key: str = Depends(verify_api_key)
):
    """
    Make a prediction using the specified model and image file.
    
    This endpoint accepts a model ID and an image file, processes the image with the specified model,
    and returns the prediction result with confidence score.
    
    Requires authentication via X-API-Key header.
    """
    # Validate file type
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate model ID
    if not model_id:
        raise HTTPException(status_code=400, detail="Model ID is required")
    
    if not model_handler.validate_model_id(model_id):
        raise HTTPException(status_code=400, detail=f"Model ID '{model_id}' not found")
    
    # Read the image file content
    image_content = await image.read()
    file_size = len(image_content)
    
    # Validate file size (limit to 10MB)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    # Generate a unique prediction ID
    prediction_id = str(uuid.uuid4())
    
    try:
        # Run prediction using the model handler
        result = model_handler.predict(model_id, image_content)
        confidence = result.get("confidence", 0.0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    
    response = PredictionResponse(
        prediction_id=prediction_id,
        model_id=model_id,
        result=result,
        confidence=confidence
    )
    
    return response


# Additional utility endpoints could be added here
@router.get("/models")
async def list_models(api_key: str = Depends(verify_api_key)):
    """List available models"""
    return {"models": model_handler.get_available_models()}