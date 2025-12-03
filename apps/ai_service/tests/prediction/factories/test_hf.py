import logging
import json
import pytest
from ai_service.services.prediction.factories import hf

logger = logging.getLogger(__name__)


# Test class for HuggingFace factories
class TestFactoriesHF:
    @pytest.mark.parametrize("model_id", ["diabetic-retinopathy-224-procnorm-vit"])
    def test_vit_clsf_model_factory(self, sample_images, model_id):
        model = hf.vit_clsf_model_factory(model_id)
        assert model is not None

        for image in sample_images:
            result = model.run(image)
            assert result is not None
            assert result.metadata.inference_time_ms > 0
            assert result.metadata.model_version == "1"
            assert len(result.predictions) > 0

            logger.info(f"===Result: {result}")

            logger.info(
                f"===Result Dict: \n\n{json.dumps(result.model_dump(), indent=4)}"
            )

    @pytest.mark.parametrize("model_id", ["swinv2_tiny_for_glaucoma_classification"])
    def test_swinv2_clsf_model_factory(self, sample_images, model_id):
        model = hf.swinv2_clsf_model_factory(model_id)
        assert model is not None

        for image in sample_images:
            result = model.run(image)
            assert result is not None
            assert result.metadata.inference_time_ms > 0
            assert result.metadata.model_version == "1"
            assert len(result.predictions) > 0

            logger.info(f"===Result: {result}")

            logger.info(
                f"===Result Dict: \n\n{json.dumps(result.model_dump(), indent=4)}"
            )

    @pytest.mark.parametrize("model_id", ["Diabetic_RetinoPathy_detection"])
    def test_dinov2_clsf_model_factory(self, sample_images, model_id):
        model = hf.dinov2_clsf_model_factory(model_id)
        assert model is not None

        for image in sample_images:
            result = model.run(image)
            assert result is not None
            assert result.metadata.inference_time_ms > 0
            assert result.metadata.model_version == "1"
            assert len(result.predictions) > 0

            logger.info(f"===Result: {result}")

            logger.info(
                f"===Result Dict: \n\n{json.dumps(result.model_dump(), indent=4)}"
            )