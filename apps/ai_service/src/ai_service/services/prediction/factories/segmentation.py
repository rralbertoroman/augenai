import torch
from pathlib import Path
from datetime import datetime
from PIL.Image import Image

from ai_service.config import settings
from ai_service.logging_config import get_logger
from ai_service.models.schemas import (
    SegmentationObject,
    SegmentationResult,
    PredictionMetadata,
)

from .model_instance import ModelInstance

logger = get_logger(__name__)

# Single source of truth for the AMD biomarker classes (also used by the adapter).
# Labels from the amd-biomarker `unet_training.ipynb` resnet34_unet experiment
# (index-keyed class_names: {0: Fondo, 1: SRF, 2: IRF, 3: SHRM, 4: PED}).
CLASS_NAMES = {
    0: "Background",
    1: "Subretinal Fluid (SRF)",
    2: "Intraretinal Fluid (IRF)",
    3: "Subretinal Hyperreflective Material (SHRM)",
    4: "Pigment Epithelial Detachment (PED)",
}
NUM_CLASSES = 5
IMG_SIZE = 512
WEIGHTS_FILENAME = "best_model.pt"


def rescale_polygon_to_original(
    points: list[list[float]],
    area: float,
    orig_size: tuple[int, int],
    model_size: int = IMG_SIZE,
) -> tuple[list[list[float]], float]:
    """Map polygon vertices and area from the model's square input space back to
    the original image resolution.

    ``preprocess_image`` stretches the image to ``model_size x model_size``
    without preserving aspect ratio, so the inverse is an independent per-axis
    scale (``sx`` for x, ``sy`` for y). Area scales by ``sx * sy``.
    """
    orig_w, orig_h = orig_size
    sx = orig_w / model_size
    sy = orig_h / model_size
    scaled = [[x * sx, y * sy] for x, y in points]
    return scaled, area * sx * sy


class SegmentationProcessor:
    """Prepares inputs for the ResNet34-UNet segmentation model: a normalized,
    batched (1, 3, 512, 512) tensor ready for the device."""

    def __call__(self, image: Image):
        # Imported lazily so the service stays importable without amd_biomarker.
        from amd_biomarker.data.transforms import preprocess_image

        return preprocess_image(image, img_size=IMG_SIZE, normalize="imagenet")


def resnet34_unet_factory(model_id: str):
    """Create a ResNet34-UNet instance for AMD biomarker segmentation"""

    class ResNet34UNetModel(ModelInstance):
        def __init__(self, model_id: str, timeout: int = 60):
            super().__init__(model_id=model_id, timeout=timeout)

            # Imported lazily so the service stays importable without amd_biomarker.
            from amd_biomarker.models import get_model

            model_path = Path(settings.weights_dir) / model_id / WEIGHTS_FILENAME
            logger.info(f"Loading {self.model_id} model from {model_path.resolve()}")

            # Build the architecture. pretrained=False is CRITICAL: pretrained=True
            # downloads ImageNet weights and hangs in a container.
            self.model = get_model(
                "resnet34_unet", num_classes=NUM_CLASSES, pretrained=False
            )

            # Load checkpoint (no metadata, keys prefixed with "model.")
            checkpoint = torch.load(
                str(model_path), map_location="cpu", weights_only=False
            )
            state_dict = (
                checkpoint["model_state_dict"]
                if "model_state_dict" in checkpoint
                else checkpoint
            )
            state_dict = {k.replace("model.", "", 1): v for k, v in state_dict.items()}
            self.model.load_state_dict(state_dict, strict=True)

            self.model.eval()

            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.model.to(self.device)

            self.processor = SegmentationProcessor()

            logger.info(f"Loaded \n\n{'==' * 20}\n\n {self.model} \n\n{'==' * 20}")

        def run(self, image: Image):
            # Original (width, height), captured before the 512x512 resize so
            # polygons can be mapped back to the source resolution.
            orig_w, orig_h = image.size
            tensor = self.processor(image).to(self.device)

            logger.info(f"Running {self.model_id} inference on device: {self.device}")

            start_time = datetime.now()
            with torch.no_grad():
                logits = self.model(tensor)  # (1, 5, H, W)
                probs = torch.softmax(logits, dim=1)
                mask = probs.argmax(dim=1)  # (1, H, W)

            # Time in milliseconds
            inference_time_ms = (datetime.now() - start_time).total_seconds() * 1000

            from amd_biomarker.data.preprocessing.mask_to_polygons import (
                masks_to_polygons,
            )

            mask_np = mask.squeeze(0).cpu().numpy().astype("uint8")
            polys = masks_to_polygons(mask_np, CLASS_NAMES)

            # Compute mean class probability per class_id once, reuse across polygons.
            confidence_by_class: dict[int, float] = {}
            predictions = []
            for poly in polys:
                # Skip degenerate (zero-area) contours — collinear slivers carry
                # no information and would render as invisible overlays.
                if poly["area"] <= 0:
                    continue

                class_id = poly["class_id"]
                if class_id not in confidence_by_class:
                    region = mask_np == class_id
                    class_probs = probs[0, class_id].cpu().numpy()
                    confidence_by_class[class_id] = float(class_probs[region].mean())
                conf = confidence_by_class[class_id]

                # Scale polygon + area out of 512x512 model space into the
                # original image resolution (consistent with detection boxes).
                scaled_polygon, scaled_area = rescale_polygon_to_original(
                    poly["polygon"], poly["area"], (orig_w, orig_h)
                )

                predictions.append(
                    SegmentationObject(
                        class_id=class_id,
                        class_name=poly["class_name"],
                        polygon=[[float(x), float(y)] for x, y in scaled_polygon],
                        area=float(scaled_area),
                        confidence=conf,
                    )
                )

            prediction_result = SegmentationResult(
                predictions=predictions,
                metadata=PredictionMetadata(
                    model_version="1",
                    inference_time_ms=inference_time_ms,
                ),
            )

            logger.info(f"Prediction result: {prediction_result}")

            return prediction_result

    return ResNet34UNetModel(model_id)
