import logging

from PIL.Image import Image

from ai_service.models.schemas import (
    ClassificationObject,
    ClassificationResult,
    PredictionMetadata,
    PredictionResult,
)
from ai_service.services.prediction.factories.model_instance import ModelInstance

from .factories import hf
from .model_pool import ModelPool

logger = logging.getLogger(__name__)


def get_mocked_classification() -> ClassificationResult:
    return ClassificationResult(
        metadata=PredictionMetadata(
            inference_time_ms=0,
            model_version="1",
            model_id="diabetic-retinopathy-224-procnorm-vit",
        ),
        predictions=[
            ClassificationObject(
                class_id=2,
                class_name="Normal",
                confidence=1.0,
            )
        ],
    )


class PredictionService:
    def __init__(self):
        factories = {
            "diabetic-retinopathy-224-procnorm-vit": hf.vit_clsf_model_factory,
        }
        self._model_pool = ModelPool(factories)
        logger.info("Prediction service initialized")

    def predict(self, image: Image, model_id: str, is_mocked: bool) -> PredictionResult:
        model: ModelInstance = self._model_pool.get_model(model_id)
        logger.info(f"Model with id '{model_id}' is ready for prediction")

        result = model.run(image) if not is_mocked else get_mocked_classification()
        return result
