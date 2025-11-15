from pathlib import Path
from .adapter_registry import ADAPTER_REGISTRY
from ai_service.config import settings


class ModelService:
    def __init__(self):
        self.weights_dir = Path(settings.weights_dir)

    def get_all_models_info(self) -> dict:
        """Return information for all models as a dictionary."""
        model_data = {}
        for model_folder in self.weights_dir.iterdir():
            if not model_folder.is_dir():
                continue

            # Run all registered adapters on the folder
            folder_info = {}
            for adapter_cls in ADAPTER_REGISTRY.values():
                adapter = adapter_cls(model_folder)
                info = adapter.extract_info()
                if info:
                    folder_info.update(info)
            if folder_info:
                model_data[model_folder.name] = folder_info

        return model_data
