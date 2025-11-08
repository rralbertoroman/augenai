import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta

from ai_service.services.prediction.model_pool import ModelPool
from ai_service.services.prediction.factories.model_instance import ModelInstance


@pytest.fixture
def mock_model_instance():
    """Fixture that returns a mock ModelInstance."""
    mock = MagicMock(spec=ModelInstance)
    mock.is_expired = False
    mock.model_id = "test_model"
    return mock


@pytest.fixture
def model_pool_fixture():
    """Fixture that sets up a ModelPool with a mock factory."""
    mock_factory = MagicMock()
    pool = ModelPool(factories={"test_model": mock_factory})
    return pool, mock_factory


class TestModelPool:
    def test_get_model_creates_new_model_if_not_exists(
        self, model_pool_fixture, mock_model_instance
    ):
        pool, mock_factory = model_pool_fixture
        mock_factory.return_value = mock_model_instance

        # Act
        result = pool.get_model("test_model")

        # Assert
        mock_factory.assert_called_once_with("test_model")
        assert result == mock_model_instance

    def test_get_model_returns_existing_model_if_not_expired(
        self, model_pool_fixture, mock_model_instance
    ):
        pool, mock_factory = model_pool_fixture
        pool._models_in_use = {"test_model": mock_model_instance}

        # Act
        result = pool.get_model("test_model")

        # Assert
        mock_factory.assert_not_called()
        mock_model_instance.update_last_used.assert_called_once()
        assert result == mock_model_instance
