from pathlib import Path

import torch
from ultralytics import YOLO
from PIL.Image import Image

from ai_service.config import settings
from ai_service.logging_config import get_logger
from ai_service.models.schemas import (
    DetectionObject,
    DetectionResult,
    PredictionMetadata,
)
from .model_instance import ModelInstance

logger = get_logger(__name__)


def ultralytics_detection_factory(model_id: str):
    """Create a YOLO model for object detection"""

    class YoloDetection(ModelInstance):
        def __init__(self, model_id: str, timeout: int = 60):
            super().__init__(model_id=model_id, timeout=timeout)

            model_path = Path(settings.weights_dir) / model_id / "best.pt"
            self.model = YOLO(str(model_path))
            self.device = "cuda" if torch.cuda.is_available() else "cpu"

            logger.info(f"Loaded \n\n{'==' * 20}\n\n {self.model} \n\n{'==' * 20}")
            logger.info(f"Classes ===>>> {self.model.names}")

        def run(self, image: Image):
            imgsz = settings.ultralytics_imgsz
            conf = settings.confidence_threshold
            iou = settings.iou_threshold

            # YOLO preprocesses internally, so self.processor is the inherited
            # passthrough; it satisfies the contract without altering the image.
            results = self.model.predict(
                self.processor(image),
                device=self.device,
                imgsz=imgsz,
                conf=conf,
                iou=iou,
            )

            # logger.info(f"{results}")
            logger.info(f"Prediction detected {len(results)} objects on the image")

            if not results:
                logger.warning(
                    "No objects were detected", extra={"iou": iou, "conf": conf}
                )
                return DetectionResult(
                    predictions=[],
                    metadata=PredictionMetadata(
                        inference_time_ms=1,
                        model_version=getattr(self.model, "__version__", "unknown"),
                    ),
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

                    # logger.info("Transformed dimensions to pixel")

                    # Convert from center x, center y, width, height to left, top, width, height
                    x_center, y_center, width, height = box

                    left = x_center - (width / 2)
                    top = y_center - (height / 2)
                    box = [left, top, width, height]

                    # logger.info("Transformed dimensions to (left,top,width,height)")

                    class_id = int(class_id.item())
                    class_name = self.model.names[class_id]
                    detection = DetectionObject(
                        class_id=class_id,
                        class_name=class_name,
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

    return YoloDetection(model_id)
