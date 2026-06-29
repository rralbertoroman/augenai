import logging
import json
import pytest
from ai_service.services.prediction.factories import (
    ultralytics as ultralytics_factories,
)

logger = logging.getLogger(__name__)


@pytest.mark.weights
class TestFactoriesUltralytics:
    @pytest.mark.parametrize("model_id", ["yolo11m_dr_lesion"])
    def test_ultralytics_detection_factory(self, sample_images, model_id):
        model = ultralytics_factories.ultralytics_detection_factory(model_id)
        assert model is not None

        for image in sample_images:
            result = model.run(image)
            assert result is not None

            logger.info(f"===Result: {result}")

            logger.info(
                f"===Result Dict: \n\n{json.dumps(result.model_dump(), indent=4)}"
            )
