from PIL.Image import Image
from ai_service.logging_config import get_logger

from ai_service.models.schemas import (
    ClassificationObject,
    ClassificationResult,
    DetectionObject,
    DetectionResult,
    PredictionMetadata,
    PredictionResult,
)
from ai_service.services.prediction.factories.model_instance import ModelInstance

from .factories import hf
from .factories import ultralytics_detection_factory
from .factories import glaucoma_resnet18_density_factory
from .model_pool import ModelPool

logger = get_logger(__name__)


def get_mocked_classification() -> ClassificationResult:
    return ClassificationResult(
        metadata=PredictionMetadata(
            inference_time_ms=0,
            model_version="1",
        ),
        predictions=[
            ClassificationObject(
                class_id=0,
                class_name="Normal",
                confidence=1.0,
            )
        ],
    )


def get_mocked_detection() -> DetectionResult:
    return DetectionResult(
        metadata=PredictionMetadata(
            inference_time_ms=0,
            model_version="1",
        ),
        predictions=[
            DetectionObject(
                class_id=0,
                class_name="Normal",
                confidence=1.0,
                box=[
                    1376.81,
                    150.967,
                    87.2196,
                    88.706,
                ],  # [x1, y1, x2, y2] placeholder coordinates
            )
        ],
    )


class PredictionService:
    def __init__(self):
        factories = {
            "diabetic-retinopathy-224-procnorm-vit": hf.vit_clsf_model_factory,
            "swinv2_tiny_for_glaucoma_classification": hf.swinv2_clsf_model_factory,
            "yolo11m_dr_lesion": ultralytics_detection_factory,
            "Diabetic_RetinoPathy_detection": hf.dinov2_clsf_model_factory,
            "glaucoma_resnet18_density": glaucoma_resnet18_density_factory,
        }
        self._model_pool = ModelPool(factories)
        logger.info("Prediction service initialized")

    def predict(self, image: Image, model_id: str, is_mocked: bool) -> PredictionResult:
        if is_mocked:
            return (
                get_mocked_classification()
                if model_id != "yolo11m_dr_lesion"
                else get_mocked_detection()
            )

        model: ModelInstance = self._model_pool.get_model(model_id)

        logger.info(f"Model with id '{model_id}' is ready for prediction")

        result = model.run(image)
        return result
