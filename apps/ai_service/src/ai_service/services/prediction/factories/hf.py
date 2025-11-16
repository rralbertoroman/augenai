import logging
from pathlib import Path
from datetime import datetime

import torch
from PIL.Image import Image
from torch import nn
from transformers import ViTForImageClassification, ViTImageProcessor

from ai_service.config import settings
from ai_service.models.schemas import (
    ClassificationResult,
    ClassificationObject,
    PredictionMetadata,
)

from .model_instance import ModelInstance

logger = logging.getLogger(__name__)


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

            # Get predicted class and confidence
            confidences = nn.functional.softmax(logits, dim=-1)
            confidences_with_idx = list(enumerate(confidences[0]))
            classification_objects = [
                ClassificationObject(
                    class_id=idx,
                    confidence=confidence,
                    class_name=model_dev.config.id2label[idx],
                )
                for idx, confidence in confidences_with_idx
                if confidence > 0.70
            ]

            # Create prediction result
            prediction_result = ClassificationResult(
                predictions=classification_objects,
                metadata=PredictionMetadata(
                    model_version="1",
                    inference_time_ms=inference_time_ms,
                ),
            )

            logger.info(f"Prediction result: {prediction_result}")

            del model_dev
            del inputs_dev
            del outputs
            del logits

            return prediction_result

    return HFViTModel(model_id)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    model = vit_clsf_model_factory("diabetic-retinopathy-224-procnorm-vit")
