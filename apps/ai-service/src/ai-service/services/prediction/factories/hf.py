import logging
import torch

from torch import nn
from transformers import ViTForImageClassification, ViTImageProcessor
from .model_instance import ModelInstance
from ..schemas import PredictionResult

logger = logging.getLogger(__name__)

def hf_vit_clsf_model_factory(model_id: str):
    """Create a ViT model for image classification"""
    class HFViTModel(ModelInstance):
        def __init__(self, model_id):
            self.model_id = model_id
            self.model = ViTForImageClassification.from_pretrained(self.model_id)
            self.processor = ViTImageProcessor.from_pretrained(self.model_id)
            self.device = "cuda" if torch.cuda.is_available() else "cpu"

            logger.info(f"Loaded \n\n {self.model} \n\n{"==" * 20}")

        def run(self, image):
            inputs = self.processor(images=image, return_tensors="pt")
            
            logger.info(f"Running {self.model_id} inference on device: {self.device}")
            model_dev = self.model.to(self.device)
            inputs_dev = inputs.to(self.device)

            with torch.no_grad():
                outputs = model_dev(**inputs_dev)
                logits = outputs.logits

            # Get predicted class and confidence
            predicted_class_idx = logits.argmax(-1).item()
            predicted_class = model_dev.config.id2label[predicted_class_idx]
            confidence = nn.functional.softmax(logits, dim=-1)[0, predicted_class_idx].item()

            # Create prediction result
            prediction_result = PredictionResult(
                class_id=predicted_class_idx,
                class_name=predicted_class,
                confidence=confidence,
                model_metadata={} # Add any relevant metadata here
            )

            logger.info(f"Prediction result: {prediction_result}")
            
            del model_dev
            del inputs_dev
            del outputs
            del logits

            return prediction_result
            
    
    return HFViTModel(model_id)