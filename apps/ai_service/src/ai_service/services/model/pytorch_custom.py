import torch
from .base_adapter import BaseModelAdapter
from .decorators import register_adapter


@register_adapter("glaucoma_resnet18_density")
class GlaucomaResnet18DensityAdapter(BaseModelAdapter):
    def extract_info(self) -> dict:
        # Custom PyTorch model uses .pt format
        model_path = self.model_path / "OCT_Glaucoma_Classifier-november.pt"

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

        # OCT Glaucoma classification: Normal G0 (0) vs Early G1 (1)
        return {
            "id": "glaucoma_resnet18_density",
            "task": "classification",
            "classes": {"Glaucoma": [(0, "Normal G0"), (1, "Early G1")]},
            "image_types": ["OCT"],
            "size": model_path.stat().st_size,  # bytes
            "parameters": num_params,
            "latest_training": last_modified,
        }
