import logging
import json
import pytest
from ai_service.services.prediction.factories import pytorch_custom

logger = logging.getLogger(__name__)


@pytest.mark.weights
class TestFactoriesPyTorchCustom:
    @pytest.mark.parametrize("model_id", ["glaucoma_resnet18_density"])
    def test_glaucoma_resnet18_density_factory(self, sample_glaucoma, model_id):
        """Test the glaucoma_resnet18_density factory with sample images"""
        model = pytorch_custom.glaucoma_resnet18_density_factory(model_id)
        assert model is not None

        for image in sample_glaucoma:
            # print("bazinga")
            result = model.run(image)
            assert result is not None
            assert result.metadata.inference_time_ms > 0
            assert result.metadata.model_version == "1"
            assert len(result.predictions) > 0

            # Check that the prediction is either Normal G0 or Early G1
            prediction = result.predictions[0]
            assert prediction.class_name in ["Normal G0", "Early G1"]
            assert prediction.class_id in [0, 1]
            assert 0.0 <= prediction.confidence <= 1.0

            logger.info(f"===Result: {result}")

            logger.info(
                f"===Result Dict: \n\n{json.dumps(result.model_dump(), indent=4)}"
            )
