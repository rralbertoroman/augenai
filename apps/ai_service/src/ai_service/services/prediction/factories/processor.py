from typing import Any, Protocol, runtime_checkable

from PIL.Image import Image


@runtime_checkable
class Processor(Protocol):
    """Contract for model input preparation.

    Given a PIL image, return the native inputs ready to be moved to the
    inference device and passed to the model. The concrete return type is
    model-family specific (e.g. a HuggingFace BatchEncoding, a tuple of
    tensors, or the image itself when preprocessing is internal to the model).
    """

    def __call__(self, image: Image) -> Any: ...


class PassthroughProcessor:
    """Processor for models that preprocess internally (e.g. YOLO).

    Returns the image unchanged so the model handles resize/normalize/device
    itself, while still satisfying the Processor contract.
    """

    def __call__(self, image: Image) -> Image:
        return image
