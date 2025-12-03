import torch
from .base_adapter import BaseModelAdapter
from .decorators import register_adapter


@register_adapter("yolo11m_dr_lesion")
class Yolo11mDrLesion(BaseModelAdapter):
    def extract_info(self) -> dict:
        # YOLO models use .pt format
        model_path = self.model_path / "best.pt"

        # Load the model to get metadata
        checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)

        # Extract model information from checkpoint
        model_dict = checkpoint.get("model", {})
        if hasattr(model_dict, "state_dict"):
            state_dict = model_dict.state_dict()
        else:
            state_dict = checkpoint

        # Count parameters
        num_params = sum(
            p.numel() for p in state_dict.values() if isinstance(p, torch.Tensor)
        )

        # Get last modified time
        last_modified = model_path.stat().st_mtime

        # YOLO11m for diabetic retinopathy lesion detection
        # Common DR lesions: Microaneurysms, Hemorrhages, Hard Exudates, Soft Exudates
        return {
            "id": "yolo11m_dr_lesion",
            "task": "detection",
            "classes": {
                "DR_Lesions": [
                    (0, "Microaneurysms"),
                    (1, "Hemorrhages"),
                    (2, "Hard_Exudates"),
                    (3, "Soft_Exudates"),
                ]
            },
            "image_types": ["Fundus"],
            "size": model_path.stat().st_size,  # bytes
            "parameters": num_params,
            "latest_training": last_modified,
        }
