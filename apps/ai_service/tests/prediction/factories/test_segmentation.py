import logging
import json

import numpy as np
import pytest
from PIL import Image

logger = logging.getLogger(__name__)

# The segmentation factory depends on the `amd_biomarker` package (and on the
# `resnet34_unet` weights being present). Skip the whole module cleanly when the
# dependency is absent; these tests are written to PASS once deps + weights exist.
pytest.importorskip(
    "amd_biomarker",
    reason="amd_biomarker dependency not installed",
)

from ai_service.models.schemas import SegmentationResult  # noqa: E402
from ai_service.services.prediction.factories.processor import Processor  # noqa: E402
from ai_service.services.prediction.factories.segmentation import (  # noqa: E402
    CLASS_NAMES,
    NUM_CLASSES,
    SegmentationProcessor,
    resnet34_unet_factory,
)


def _synthetic_oct_image() -> Image.Image:
    """Build a synthetic 512x512 RGB image so the factory test runs even with an
    empty `tests/amd-sample` directory (no real OCT sample is available)."""
    arr = (np.random.rand(512, 512, 3) * 255).astype("uint8")
    return Image.fromarray(arr)


class TestFactoriesSegmentation:
    @pytest.mark.parametrize("model_id", ["resnet34_unet"])
    def test_resnet34_unet_factory(self, model_id):
        """Test the resnet34_unet factory on a synthetic 512x512 RGB image."""
        model = resnet34_unet_factory(model_id)
        assert model is not None

        image = _synthetic_oct_image()
        result = model.run(image)

        assert result is not None
        assert isinstance(result, SegmentationResult)
        assert result.metadata.inference_time_ms > 0
        assert result.metadata.model_version == "1"

        # Polygons may be empty if the model predicts all-background on noise.
        assert isinstance(result.predictions, list)

        for prediction in result.predictions:
            assert prediction.class_id in range(NUM_CLASSES)
            assert prediction.class_name in CLASS_NAMES.values()
            assert len(prediction.polygon) >= 3
            assert prediction.area > 0
            if prediction.confidence is not None:
                assert 0.0 <= prediction.confidence <= 1.0

        logger.info(f"===Result: {result}")
        logger.info(f"===Result Dict: \n\n{json.dumps(result.model_dump(), indent=4)}")


class TestSegmentationProcessor:
    def test_satisfies_processor_contract(self):
        assert isinstance(SegmentationProcessor(), Processor)
