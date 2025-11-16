import logging

from PIL.Image import Image

from ai_service.models.schemas import PredictionResult
from ai_service.services.prediction.factories.model_instance import ModelInstance

from .factories import hf
from .model_pool import ModelPool

logger = logging.getLogger(__name__)


class PredictionService:
    def __init__(self):
        factories = {
            "diabetic-retinopathy-224-procnorm-vit": hf.vit_clsf_model_factory,
        }
        self._model_pool = ModelPool(factories)
        logger.info("Prediction service initialized")

    def predict(self, image: Image, model_id: str) -> PredictionResult:
        model: ModelInstance = self._model_pool.get_model(model_id)
        logger.info(f"Model with id '{model_id}' is ready for prediction")

        result = model.run(image)
        return result
