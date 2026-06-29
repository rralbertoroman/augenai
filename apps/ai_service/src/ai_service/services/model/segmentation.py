import torch
from .base_adapter import BaseModelAdapter
from .decorators import register_adapter


@register_adapter("resnet34_unet")
class ResNet34UNetAdapter(BaseModelAdapter):
    def extract_info(self) -> dict:
        # ResNet34-UNet segmentation model uses .pt format
        model_path = self.model_path / "best_model.pt"

        if not model_path.exists():
            return {}

        # Load the model checkpoint to get metadata
        checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)

        # Extract state dict - could be directly the state dict or nested
        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
            state_dict = checkpoint["state_dict"]
        else:
            # Assume checkpoint is the state dict itself
            state_dict = checkpoint

        # Count parameters
        num_params = sum(
            p.numel() for p in state_dict.values() if isinstance(p, torch.Tensor)
        )

        # Get last modified time
        last_modified = model_path.stat().st_mtime

        # Reuse the single source of truth for class labels.
        from ai_service.services.prediction.factories.segmentation import CLASS_NAMES

        return {
            "id": "resnet34_unet",
            "task": "segmentation",
            "classes": {"AMD biomarkers": [(k, v) for k, v in CLASS_NAMES.items()]},
            "image_types": ["OCT"],
            "size": model_path.stat().st_size,  # bytes
            "parameters": num_params,
            "latest_training": last_modified,
        }
