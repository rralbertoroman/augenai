from pathlib import Path
from logging import getLogger

import torch
from ultralytics import YOLO
from PIL.Image import Image

from ai_service.config import settings
from ai_service.models.schemas import (
    DetectionObject,
    DetectionResult,
    PredictionMetadata,
)
from .model_instance import ModelInstance

logger = getLogger(__name__)


def ultralytics_detection_factory(model_id: str):
    """Create a YOLO model for object detection"""

    class YOLO_Detection(ModelInstance):
        def __init__(self, model_id: str, timeout: int = 60):
            super().__init__(model_id=model_id, timeout=timeout)

            model_path = Path(settings.weights_dir) / model_id / "best.pt"
            self.model = YOLO(str(model_path))
            self.device = "cuda" if torch.cuda.is_available() else "cpu"

            logger.info(f"Loaded \n\n{'==' * 20}\n\n {self.model} \n\n{'==' * 20}")

        def run(self, image: Image):
            imgsz = settings.ultralytics_imgsz
            conf = settings.confidence_threshold
            iou = settings.iou_threshold

            # Run prediction
            results = self.model.predict(
                image, device=self.device, imgsz=imgsz, conf=conf, iou=iou
            )

            # Convert results to DetectionResult format
            detection_objects = []
            for result in results:
                for box, conf, class_id in zip(
                    result.boxes.xywhn, result.boxes.conf, result.boxes.cls
                ):
                    box[::2] *= image.width
                    box[1::2] *= image.height
                    box = box.tolist()

                    # Convert from center x, center y, width, height to left, top, width, height
                    x_center, y_center, width, height = box

                    left = x_center - (width / 2)
                    top = y_center - (height / 2)
                    box = [left, top, width, height]

                    detection = DetectionObject(
                        class_id=int(class_id.item()),
                        class_name=self.model.names[int(class_id.item())],
                        confidence=conf.item(),
                        box=box,  # Already converted to list [left, top, width, height]
                    )
                    detection_objects.append(detection)

            return DetectionResult(
                predictions=detection_objects,
                metadata=PredictionMetadata(
                    inference_time_ms=results[0].speed.get("inference", 0),
                    model_version=getattr(self.model, "__version__", "unknown"),
                ),
            )

    return YOLO_Detection(model_id)
