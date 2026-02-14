import numpy as np
import cv2
import torch
from pathlib import Path
from datetime import datetime
from PIL.Image import Image
from torch import nn
from torchvision import models, transforms

from ai_service.config import settings
from ai_service.logging_config import get_logger
from ai_service.models.schemas import (
    ClassificationResult,
    ClassificationObject,
    PredictionMetadata,
)

from .model_instance import ModelInstance

logger = get_logger(__name__)


class OCTModel(nn.Module):
    """
    OCT Glaucoma Classification Model.
    ResNet18 backbone (1-channel input) + vascular density feature.
    """

    def __init__(self):
        super(OCTModel, self).__init__()
        # Load ResNet18 and modify for 1-channel input
        self.cnn = models.resnet18(weights=None)
        self.cnn.conv1 = nn.Conv2d(
            1, 64, kernel_size=7, stride=2, padding=3, bias=False
        )
        # Remove the final FC layer to get features
        self.cnn.fc = nn.Identity()

        # Classifier: 512 (ResNet18 features) + 1 (density) = 513
        self.classifier = nn.Sequential(
            nn.Linear(513, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid(),
        )

    def forward(self, img, densidad):
        """
        Forward pass.
        Args:
            img: Tensor of shape (batch, 1, 224, 224)
            densidad: Tensor of shape (batch, 1)
        Returns:
            Tensor of shape (batch, 1) with sigmoid output
        """
        img_feat = self.cnn(img)  # (batch, 512)
        x = torch.cat((img_feat, densidad), dim=1)  # (batch, 513)
        return self.classifier(x)  # (batch, 1)


def compute_vascular_density(image: Image) -> torch.Tensor:
    """
    Compute vascular density from a PIL image.
    Converts to grayscale, applies binary threshold at 180,
    and computes the ratio of white pixels.

    Args:
        image: PIL Image

    Returns:
        Tensor of shape [1] containing the density value
    """
    # Convert to grayscale numpy array
    img_gray = image.convert("L")
    img_np = np.array(img_gray)

    # Apply binary threshold at 180
    _, binar = cv2.threshold(img_np, 180, 255, cv2.THRESH_BINARY)

    # Compute density
    density = np.sum(binar == 255) / binar.size

    # Return as tensor
    return torch.tensor([density], dtype=torch.float32)


def glaucoma_resnet18_density_factory(model_id: str):
    """Create an OCTModel instance for glaucoma classification"""

    class GlaucomaResnet18DensityModel(ModelInstance):
        def __init__(self, model_id: str, timeout: int = 60):
            super().__init__(model_id=model_id, timeout=timeout)

            model_path = (
                Path(settings.weights_dir)
                / model_id
                / "OCT_Glaucoma_Classifier-november.pt"
            )
            logger.info(f"Loading {self.model_id} model from {model_path.resolve()}")

            # Initialize the model
            self.model = OCTModel()

            # Load weights
            checkpoint = torch.load(
                str(model_path), map_location="cpu", weights_only=False
            )

            # Handle different checkpoint formats
            if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                state_dict = checkpoint["model_state_dict"]
            elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
                state_dict = checkpoint["state_dict"]
            else:
                state_dict = checkpoint

            self.model.load_state_dict(state_dict)
            self.model.eval()

            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.model.to(self.device)

            # Define transforms (same as in the notebook)
            self.transform = transforms.Compose(
                [
                    transforms.Resize((224, 224)),
                    transforms.Grayscale(num_output_channels=1),
                    transforms.ToTensor(),
                    transforms.Normalize(mean=[0.5], std=[0.5]),
                ]
            )

            logger.info(f"Loaded \n\n{'==' * 20}\n\n {self.model} \n\n{'==' * 20}")

        def run(self, image: Image):
            # Compute vascular density
            density = compute_vascular_density(image)

            # Transform the image
            img_tensor = self.transform(image).unsqueeze(0)  # (1, 1, 224, 224)

            # Move to device
            img_tensor = img_tensor.to(self.device)
            density = density.to(self.device)

            logger.info(f"Running {self.model_id} inference on device: {self.device}")

            start_time = datetime.now()
            with torch.no_grad():
                output = self.model(img_tensor, density.unsqueeze(0))  # (1, 1)

            # Time in milliseconds
            inference_time_ms = (datetime.now() - start_time).total_seconds() * 1000

            # Interpret output: >= 0.5 -> Early G1 (1), < 0.5 -> Normal G0 (0)
            prediction_value = output.item()
            if prediction_value >= 0.5:
                class_id = 1
                class_name = "Early G1"
                confidence = prediction_value
            else:
                class_id = 0
                class_name = "Normal G0"
                confidence = 1.0 - prediction_value

            prediction_result = ClassificationResult(
                predictions=[
                    ClassificationObject(
                        class_id=class_id,
                        class_name=class_name,
                        confidence=confidence,
                    )
                ],
                metadata=PredictionMetadata(
                    model_version="1",
                    inference_time_ms=inference_time_ms,
                ),
            )

            logger.info(f"Prediction result: {prediction_result}")

            return prediction_result

    return GlaucomaResnet18DensityModel(model_id)
