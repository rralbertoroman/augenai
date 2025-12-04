import logging
from pathlib import Path
from datetime import datetime

import torch
from PIL.Image import Image
from torch import nn
from transformers import (
    AutoImageProcessor,
    Swinv2ForImageClassification,
    ViTForImageClassification,
    Dinov2ForImageClassification,
    ViTImageProcessor,
    PreTrainedModel,
)

from ai_service.config import settings
from ai_service.logging_config import get_logger
from ai_service.models.schemas import (
    ClassificationResult,
    ClassificationObject,
    PredictionMetadata,
)

from .model_instance import ModelInstance

from .constants import (
    UNKNOWN_DISEASE_ID,
    UNKNOWN_DISEASE_NAME,
)

logger = get_logger(__name__)


def process_classification_output(
    logits: torch.Tensor,
    model: PreTrainedModel,
    inference_time_ms: float,
    model_version: str = "1",
    confidence_threshold: float = None,
) -> ClassificationResult:
    """
    Process model logits and return a ClassificationResult.

    Args:
        logits: Raw output logits from the model
        model: The model instance (needed for class labels)
        inference_time_ms: Time taken for inference in milliseconds
        model_version: Version string for the model
        confidence_threshold: Minimum confidence threshold for predictions

    Returns:
        ClassificationResult: The processed classification result
    """
    if confidence_threshold is None:
        confidence_threshold = settings.confidence_threshold

    # Apply softmax to get confidence scores
    confidences = nn.functional.softmax(logits, dim=-1)
    confidences_with_idx = list(enumerate(confidences[0]))

    num_scores = len(confidences_with_idx)
    logger.info(
        f"Found {num_scores} confidence scores with indices: {confidences_with_idx}",
        extra={
            "log_type": "prediction",
            "num_scores": num_scores,
        },
    )

    # Filter predictions by confidence threshold
    classification_objects = [
        ClassificationObject(
            class_id=idx,
            confidence=float(confidence),  # Convert torch.Tensor to float
            class_name=model.config.id2label[idx],
        )
        for idx, confidence in confidences_with_idx
        if confidence > confidence_threshold
    ]

    missing_predictions = len(confidences_with_idx) - len(classification_objects)
    total_predictions = len(confidences_with_idx)

    logger.info(
        f"classification_objects: {classification_objects}, missing predictions: {missing_predictions}"
    )

    if missing_predictions > 0:
        logger.warning(
            f"Filtered out {missing_predictions} out of {total_predictions} predictions below confidence threshold of {confidence_threshold:.2f}",
            extra={
                "log_type": "prediction",
                "confidence_threshold": confidence_threshold,
                "missing_predictions": missing_predictions,
                "total_predictions": total_predictions,
                "kept_predictions": len(classification_objects),
            },
        )

    if not classification_objects:
        logger.warning(
            "No predictions above confidence threshold. Returning 'Unknown' class.",
            extra={
                "log_type": "prediction",
                "confidence_threshold": confidence_threshold,
            },
        )
        classification_objects = [
            ClassificationObject(
                class_id=UNKNOWN_DISEASE_ID,
                confidence=1.0,
                class_name=UNKNOWN_DISEASE_NAME,
            )
        ]

    # Create and return the prediction result
    return ClassificationResult(
        predictions=classification_objects,
        metadata=PredictionMetadata(
            model_version=model_version,
            inference_time_ms=inference_time_ms,
        ),
    )


def swinv2_clsf_model_factory(model_id: str):
    """Create a SwinV2 model for image classification"""

    class HFSwinV2Model(ModelInstance):
        def __init__(self, model_id: str, timeout: int = 60):
            super().__init__(model_id=model_id, timeout=timeout)

            model_path = Path(settings.weights_dir) / self.model_id
            logger.info(f"Loading {self.model_id} model from {model_path.resolve()}")
            self.model = Swinv2ForImageClassification.from_pretrained(str(model_path))
            self.processor = AutoImageProcessor.from_pretrained(str(model_path))
            self.device = "cuda" if torch.cuda.is_available() else "cpu"

            logger.info(f"Loaded \n\n{'==' * 20}\n\n {self.model} \n\n{'==' * 20}")

        def run(self, image: Image):
            inputs = self.processor(images=image, return_tensors="pt")

            logger.info(f"Running {self.model_id} inference on device: {self.device}")
            model_dev = self.model.to(self.device)
            inputs_dev = inputs.to(self.device)

            start_time = datetime.now()
            with torch.no_grad():
                outputs = model_dev(**inputs_dev)
                logits = outputs.logits

            # time in milliseconds
            inference_time_ms = (datetime.now() - start_time).total_seconds() * 1000

            # Process logits and create prediction result
            prediction_result = process_classification_output(
                logits=logits,
                model=model_dev,
                inference_time_ms=inference_time_ms,
            )

            logger.info(f"Prediction result: {prediction_result}")

            del model_dev
            del inputs_dev
            del outputs
            del logits

            return prediction_result

    return HFSwinV2Model(model_id)


def vit_clsf_model_factory(model_id: str):
    """Create a ViT model for image classification"""

    class HFViTModel(ModelInstance):
        def __init__(self, model_id: str, timeout: int = 60):
            super().__init__(model_id=model_id, timeout=timeout)

            model_path = Path(settings.weights_dir) / self.model_id
            logger.info(f"Loading {self.model_id} model from {model_path.resolve()}")
            self.model = ViTForImageClassification.from_pretrained(str(model_path))
            self.processor = ViTImageProcessor.from_pretrained(str(model_path))
            self.device = "cuda" if torch.cuda.is_available() else "cpu"

            logger.info(f"Loaded \n\n{'==' * 20}\n\n {self.model} \n\n{'==' * 20}")

        def run(self, image: Image):
            inputs = self.processor(images=image, return_tensors="pt")

            logger.info(f"Running {self.model_id} inference on device: {self.device}")
            model_dev = self.model.to(self.device)
            inputs_dev = inputs.to(self.device)

            start_time = datetime.now()
            with torch.no_grad():
                outputs = model_dev(**inputs_dev)
                logits = outputs.logits

            # time in milliseconds
            inference_time_ms = (datetime.now() - start_time).total_seconds() * 1000

            # Process logits and create prediction result
            prediction_result = process_classification_output(
                logits=logits,
                model=model_dev,
                inference_time_ms=inference_time_ms,
            )

            logger.info(f"Prediction result: {prediction_result}")

            del model_dev
            del inputs_dev
            del outputs
            del logits

            return prediction_result

    return HFViTModel(model_id)


def dinov2_clsf_model_factory(model_id: str):
    """Create a Dinov2 model for image classification"""

    class HFDinov2Model(ModelInstance):
        def __init__(self, model_id: str, timeout: int = 60):
            super().__init__(model_id=model_id, timeout=timeout)

            model_path = Path(settings.weights_dir) / self.model_id
            logger.info(f"Loading {self.model_id} model from {model_path.resolve()}")
            self.model = Dinov2ForImageClassification.from_pretrained(str(model_path))
            self.processor = AutoImageProcessor.from_pretrained(str(model_path))
            self.device = "cuda" if torch.cuda.is_available() else "cpu"

            logger.info(f"Loaded \n\n{'==' * 20}\n\n {self.model} \n\n{'==' * 20}")

        def run(self, image: Image):
            inputs = self.processor(images=image, return_tensors="pt")

            logger.info(f"Running {self.model_id} inference on device: {self.device}")
            model_dev = self.model.to(self.device)
            inputs_dev = inputs.to(self.device)

            start_time = datetime.now()
            with torch.no_grad():
                outputs = model_dev(**inputs_dev)
                logits = outputs.logits

            # time in milliseconds
            inference_time_ms = (datetime.now() - start_time).total_seconds() * 1000

            # Process logits and create prediction result
            prediction_result = process_classification_output(
                logits=logits,
                model=model_dev,
                inference_time_ms=inference_time_ms,
            )

            logger.info(f"Prediction result: {prediction_result}")

            del model_dev
            del inputs_dev
            del outputs
            del logits

            return prediction_result

    return HFDinov2Model(model_id)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    model = vit_clsf_model_factory("diabetic-retinopathy-224-procnorm-vit")
