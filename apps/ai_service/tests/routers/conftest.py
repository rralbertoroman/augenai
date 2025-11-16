import pytest
from fastapi.testclient import TestClient
from ai_service.main import app
from ai_service.config import settings


@pytest.fixture
def client():
    return TestClient(
        app, headers={"X-API-Key": settings.ai_prediction_service_secret_key}
    )


@pytest.fixture
def test_model():
    return "diabetic-retinopathy-224-procnorm-vit"
