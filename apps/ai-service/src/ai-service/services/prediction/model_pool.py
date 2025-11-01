from typing import Dict, Callable
from .factories import ModelInstance

class ModelPool:
    _models_in_use = {}
    _factories = {}

    def __init__(self, factories: Dict[str, Callable[str]]):
        self._factories = factories
    
    def _get_model_instance(self, model_id) -> Callable[str]:
        return self._factories.get(model_id) # ModelNotFound errors are handled on NextJS

    def get_model(self, model_id) -> ModelInstance:
        
        if model_id in self._models_in_use:
            return self._models_in_use[model_id]
        
        model_factory = self._get_model_instance(model_id)
        model = model_factory(model_id)

        self._models_in_use[model_id] = model
        return model