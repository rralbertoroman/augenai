from typing import Type, Dict
from .base_adapter import BaseModelAdapter

# Global registry to store adapters
ADAPTER_REGISTRY: Dict[str, Type["BaseModelAdapter"]] = {}


def register_adapter(model_id: str):
    """Decorator to register a model adapter."""
    def decorator(cls: Type["BaseModelAdapter"]) -> Type["BaseModelAdapter"]:
        ADAPTER_REGISTRY[model_id] = cls
        return cls
    return decorator
