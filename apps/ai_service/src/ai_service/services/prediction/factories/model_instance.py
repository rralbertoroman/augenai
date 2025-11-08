from abc import ABC, abstractmethod
from datetime import datetime


class ModelInstance(ABC):
    def __init__(self, model_id: str, timeout: int = 60):
        """
        Initialize a model instance with expiration tracking.

        Args:
            model_id: Model identifier
            timeout: Time in minutes after which the model is considered expired
        """
        self.model_id = model_id
        self._last_used_at = datetime.now().timestamp()
        self._timeout = timeout * 60

    @abstractmethod
    def run(self, image):
        """Run inference on the input image.

        Args:
            image: Input image for inference

        Returns:
            Inference result
        """

        pass

    def update_last_used(self):
        self._last_used_at = datetime.now().timestamp()

    @property
    def is_expired(self) -> bool:
        """Check if the model instance has expired.

        Returns:
            bool: True if the model has expired, False otherwise
        """
        timestamp = datetime.now().timestamp()
        return timestamp > self._last_used_at + self._timeout
