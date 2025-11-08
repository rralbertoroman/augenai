import logging
from ai_service.services.prediction.factories import hf

logger = logging.getLogger(__name__)


# Test class for HuggingFace factories
class TestFactoriesHF:
    def test_vit_clsf_model_factory(self, sample_images):
        model = hf.vit_clsf_model_factory("diabetic-retinopathy-224-procnorm-vit")
        assert model is not None

        for image in sample_images:
            result = model.run(image)
            assert result is not None
