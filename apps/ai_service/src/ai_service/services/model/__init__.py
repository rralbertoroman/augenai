from .service import ModelService
from . import hf  # noqa: F401 - Import to register adapters
from . import ultralytics  # noqa: F401 - Import to register adapters
from . import pytorch_custom  # noqa: F401 - Import to register adapters
from . import segmentation  # noqa: F401 - Import to register adapters

__all__ = ["ModelService"]
