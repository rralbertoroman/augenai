import pytest
from unittest.mock import MagicMock, patch
from PIL import Image

from ai_service.services.prediction.service import (
    PredictionService,
    get_mocked_classification,
)
from ai_service.models.schemas import (
    ClassificationResult,
    DetectionResult,
)


class TestPredictionService:
    """Test suite for PredictionService"""

    @pytest.fixture
    def prediction_service(self):
        """Fixture that creates a PredictionService instance"""
        return PredictionService()

    @pytest.fixture
    def mock_image(self):
        """Fixture that creates a mock PIL Image"""
        return MagicMock(spec=Image.Image)

    def test_predict_with_mocked_classification(self, prediction_service, mock_image):
        """Test that predict returns mocked classification for classification models"""
        result = prediction_service.predict(
            image=mock_image,
            model_id="diabetic-retinopathy-224-procnorm-vit",
            is_mocked=True,
        )

        assert isinstance(result, ClassificationResult)
        assert len(result.predictions) == 1

    def test_predict_with_mocked_detection(self, prediction_service, mock_image):
        """Test that predict returns mocked detection for detection models"""
        result = prediction_service.predict(
            image=mock_image, model_id="yolo11m_dr_lesion", is_mocked=True
        )

        assert isinstance(result, DetectionResult)
        assert result.predictions[0].box == [0.0, 0.0, 0.0, 0.0]

    def test_predict_calls_model_pool_when_not_mocked(
        self, prediction_service, mock_image
    ):
        """Test that predict calls model pool when is_mocked=False"""
        with patch.object(
            prediction_service._model_pool, "get_model"
        ) as mock_get_model:
            mock_model = MagicMock()
            mock_result = get_mocked_classification()
            mock_model.run.return_value = mock_result
            mock_get_model.return_value = mock_model

            result = prediction_service.predict(
                image=mock_image,
                model_id="diabetic-retinopathy-224-procnorm-vit",
                is_mocked=False,
            )

            mock_get_model.assert_called_once_with(
                "diabetic-retinopathy-224-procnorm-vit"
            )
            mock_model.run.assert_called_once_with(mock_image)
            assert result == mock_result
