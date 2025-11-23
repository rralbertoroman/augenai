from pathlib import Path
from typing import Dict
from .decorators import ADAPTER_REGISTRY


def load_all_models(weights_dir: str) -> Dict[str, dict]:
    """Iterate over all subfolders in /weights and extract info using registered adapters."""
    weights_path = Path(weights_dir)
    model_data = {}
    for model_id_folder in weights_path.iterdir():
        if not model_id_folder.is_dir():
            continue
        for adapter_cls in ADAPTER_REGISTRY.values():
            adapter = adapter_cls(model_id_folder)
            info = adapter.extract_info()
            if info:
                model_data[model_id_folder.name] = info
    return model_data
