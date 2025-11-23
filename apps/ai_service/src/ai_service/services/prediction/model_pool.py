from typing import Callable, Dict

from .factories import ModelInstance


class ModelPool:
    _models_in_use: Dict[str, ModelInstance] = {}
    _factories = {}

    def __init__(self, factories: Dict[str, Callable[[str, int], ModelInstance]]):
        self._factories = factories

    def _get_model_instance(self, model_id) -> Callable[[str, int], ModelInstance]:
        return self._factories.get(model_id)

    def _create_model(self, model_id) -> ModelInstance:
        model_factory = self._get_model_instance(model_id)
        model = model_factory(model_id)
        self._models_in_use[model_id] = model
        return model

    def get_model(self, model_id: str) -> ModelInstance:
        if (model := self._models_in_use.get(model_id)) is not None:
            model.update_last_used()
            return model

        # Lazy drop the expired models,
        # safe to do because the requested model
        # does not exist in the dictionary
        # TODO: Check if there might be any conflict with models in use
        self._models_in_use = {
            model_id: model
            for model_id, model in self._models_in_use.items()
            if not model.is_expired
        }

        return self._create_model(model_id)
