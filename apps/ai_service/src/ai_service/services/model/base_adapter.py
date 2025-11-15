from abc import ABC, abstractmethod
from pathlib import Path


class BaseModelAdapter(ABC):
    """Abstract Adapter interface for model info loading."""

    def __init__(self, model_path: Path):
        self.model_path = model_path

    @abstractmethod
    def extract_info(self) -> dict:
        """Extract model information from folder."""
        pass
