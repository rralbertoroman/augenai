from ..config import settings
from .factories import hf
from .model_pool import ModelPool


class ModelService:
    def __init__(self):
        factories = {
            "diabetic-retinopathy-224-procnorm-vit": hf.vit_clsf_model_factory,
        }
        self._model_pool = ModelPool(factories)

    def predict(self, image, model_id):
        model = self._model_pool.get_model(model_id)

        result = model.run(image)
        return result
