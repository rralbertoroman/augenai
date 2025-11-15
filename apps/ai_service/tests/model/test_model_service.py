import json
import logging
from datetime import datetime
from ai_service.services.model import ModelService

logger = logging.getLogger(__name__)


def test_get_all_models_info():
    model_service = ModelService()
    models_info = model_service.get_all_models_info()
    assert models_info

    transformed_models_info = {}

    for name, info in models_info.items():
        transformed_info = info.copy()
        transformed_info["size"] = round(info["size"] / (1024 * 1024), 2)
        transformed_info["latest_training"] = datetime.fromtimestamp(
            info["latest_training"]
        ).strftime("%Y_%m_%d_%H_%M_%S")
        transformed_models_info[name] = transformed_info

    logger.info(
        f"=== Retrieved model info with transformations: {json.dumps(transformed_models_info, indent=4, sort_keys=True)}"
    )
