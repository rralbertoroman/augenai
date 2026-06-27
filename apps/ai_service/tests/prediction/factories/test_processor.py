import torch
from PIL import Image
from torchvision import transforms

from ai_service.services.prediction.factories.processor import (
    Processor,
    PassthroughProcessor,
)
from ai_service.services.prediction.factories.pytorch_custom import GlaucomaProcessor


def _dummy_image():
    return Image.new("RGB", (256, 256), color=(128, 128, 128))


class TestPassthroughProcessor:
    def test_returns_image_unchanged(self):
        image = _dummy_image()
        assert PassthroughProcessor()(image) is image

    def test_satisfies_processor_contract(self):
        assert isinstance(PassthroughProcessor(), Processor)


class TestGlaucomaProcessor:
    def test_returns_ready_image_and_density_tensors(self):
        transform = transforms.Compose(
            [
                transforms.Resize((224, 224)),
                transforms.Grayscale(num_output_channels=1),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.5], std=[0.5]),
            ]
        )
        img_tensor, density = GlaucomaProcessor(transform)(_dummy_image())

        assert isinstance(img_tensor, torch.Tensor)
        assert img_tensor.shape == (1, 1, 224, 224)
        assert isinstance(density, torch.Tensor)
        assert density.shape == (1, 1)

    def test_satisfies_processor_contract(self):
        assert isinstance(GlaucomaProcessor(transform=lambda x: x), Processor)
