import json
import torch
from .base_adapter import BaseModelAdapter
from .decorators import register_adapter
from .task_mapper import get_model_task


@register_adapter("diabetic-retinopathy-224-procnorm-vit")
class DiabeticRetinopathy224ProcNormVit(BaseModelAdapter):
    def extract_info(self) -> dict:
        config_path = self.model_path / "config.json"
        with open(config_path, "r") as f:
            config = json.load(f)

        bin_model_path = self.model_path / "pytorch_model.bin"
        state_dict = torch.load(bin_model_path, map_location="cpu")
        num_params = sum(p.numel() for p in state_dict.values())

        last_modified = (self.model_path / "pytorch_model.bin").stat().st_mtime

        task = get_model_task(config["problem_type"])

        return {
            "id": "diabetic-retinopathy-224-procnorm-vit",
            "task": task,
            "classes": {"DR": [(0, 1), (1, 2), (2, 0), (3, 4), (4, 3)]},
            "image_types": ["Fundus"],
            "size": bin_model_path.stat().st_size,  # bytes
            "parameters": num_params,
            "latest_training": last_modified,
        }


@register_adapter("swinv2_tiny_for_glaucoma_classification")
class Swinv2TinyForGlaucomaClassification(BaseModelAdapter):
    def extract_info(self) -> dict:
        config_path = self.model_path / "config.json"
        with open(config_path, "r") as f:
            config = json.load(f)

        bin_model_path = self.model_path / "pytorch_model.bin"
        state_dict = torch.load(bin_model_path, map_location="cpu")
        num_params = sum(p.numel() for p in state_dict.values())

        last_modified = (self.model_path / "pytorch_model.bin").stat().st_mtime

        task = get_model_task(config["problem_type"])

        return {
            "id": "swinv2_tiny_for_glaucoma_classification",
            "task": task,
            "classes": {"Glaucoma": [(0, 1)]},
            "image_types": ["Fundus"],
            "size": bin_model_path.stat().st_size,  # bytes
            "parameters": num_params,
            "latest_training": last_modified,
        }


@register_adapter("Diabetic_RetinoPathy_detection")
class DiabeticRetinopathyDetection(BaseModelAdapter):
    def extract_info(self) -> dict:
        config_path = self.model_path / "config.json"
        with open(config_path, "r") as f:
            config = json.load(f)

        # This model uses safetensors format
        from safetensors import safe_open

        safetensors_path = self.model_path / "model.safetensors"
        num_params = 0
        with safe_open(safetensors_path, framework="pt", device="cpu") as f:
            for key in f.keys():
                tensor = f.get_tensor(key)
                num_params += tensor.numel()

        last_modified = safetensors_path.stat().st_mtime

        task = get_model_task(config["problem_type"])

        # Diabetic Retinopathy has 5 severity levels: 0-4
        # 0: No DR, 1: Mild, 2: Moderate, 3: Severe, 4: Proliferative DR
        return {
            "id": "Diabetic_RetinoPathy_detection",
            "task": task,
            "classes": {
                "Diabetic_Retinopathy": [
                    (0, 0),  # No DR
                    (1, 1),  # Mild
                    (2, 2),  # Moderate
                    (3, 3),  # Severe
                    (4, 4),  # Proliferative DR
                ]
            },
            "image_types": ["Fundus"],
            "size": safetensors_path.stat().st_size,  # bytes
            "parameters": num_params,
            "latest_training": last_modified,
        }
