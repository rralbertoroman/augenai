"""AI predictions endpoints"""

import io
import logging
from PIL import Image as PILImage

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends

from ..utils.model_handler import model_handler
from ..auth.auth import verify_api_key
from ai_service.models.schemas import PredictionResponse, PredictionStatus
from ai_service.services import PredictionService

router = APIRouter(tags=["predictions"])

logger = logging.getLogger(__name__)
prediction_service = PredictionService()


@router.post("/predict", response_model=PredictionResponse)
async def predict(
    model_id: str = Form(..., description="ID of the model to use for prediction"),
    image: UploadFile = File(..., description="Image file to analyze"),
    is_mocked: bool = Form(False, description="Mock the prediction result"),
    api_key: str = Depends(verify_api_key),
):
    """
    Make a prediction using the specified model and image file.

    This endpoint accepts a model ID and an image file, processes the image with the specified model,
    and returns the prediction result with confidence score.

    Requires authentication via X-API-Key header.
    """
    # Validate model ID
    if not model_id:
        raise HTTPException(status_code=400, detail="Model ID is required")

    logger.info("Received model id")

    # Validate file type
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    logger.info("Received image file")

    # Read the image file content
    image_content = await image.read()
    file_size_mb = len(image_content) / (1024 * 1024)

    # Validate file size (limit to 10MB)
    if file_size_mb > 10:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds 10MB limit, received {file_size_mb:.2f}MB",
        )

    logger.info(f"Received image with size: {file_size_mb:.2f}MB")
    # Load the image using PIL
    try:
        image = PILImage.open(io.BytesIO(image_content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error loading image: {str(e)}")

    try:
        # Run prediction using the model handler
        result = prediction_service.predict(image, model_id, is_mocked)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    response = PredictionResponse(
        status=PredictionStatus.SUCCESS,
        result=result,
    )

    return response


# Additional utility endpoints could be added here
@router.get("/models")
async def list_models(api_key: str = Depends(verify_api_key)):
    """List available models"""
    return {"models": model_handler.get_available_models()}
