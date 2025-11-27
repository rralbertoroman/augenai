from pathlib import Path
from .adapter_registry import ADAPTER_REGISTRY
from ai_service.config import settings
from ai_service.logging_config import get_logger

logger = get_logger(__name__)


class ModelService:
    def __init__(self):
        self.weights_dir = Path(settings.weights_dir)

    def get_all_models_info(self) -> dict:
        """Retrieve metadata for all available model adapters.

        Scans the configured weights directory and collects information about each
        model by initializing their respective adapters. Each model's information
        includes adapter-specific metadata and configuration.

        Returns:
            dict[str, dict]: A dictionary mapping model folder names to their
                corresponding model information. Each value is a dictionary containing
                adapter-specific metadata. The 'id' field is guaranteed to match the
                folder name for consistent referencing.

        Note:
            Only directories containing valid adapter implementations will be included
            in the results. Invalid or unsupported model directories are skipped.
        """
        model_data = {}
        for model_folder in self.weights_dir.iterdir():
            if not model_folder.is_dir():
                continue

            model_name = model_folder.name
            logger.info(f"Processing adapter: {model_name}")

            adapter_cls = ADAPTER_REGISTRY[model_name]
            adapter = adapter_cls(model_folder)
            info = adapter.extract_info()
            if not info:
                continue

            model_data[model_name] = {
                "id": model_name,
                **info,
            }

        return model_data
