import logging
import io

import pytest

logger = logging.getLogger(__name__)


@pytest.mark.weights
def test_predictions(client, sample_bytes_images, test_model):
    for image in sample_bytes_images:
        _, image_file = image

        response = client.post(
            "api/v1/predict",
            files={"image": image_file},
            data={"model_id": test_model},
        )

        if response.status_code != 200:
            logger.error(response.text)
        assert response.status_code == 200

        response_dict = response.json()
        assert response_dict["status"] == "success"
        assert response_dict["error"] is None
        assert response_dict["result"]["metadata"]["inference_time_ms"] > 0
        assert response_dict["result"]["predictions"] is not None

        logger.info(f"Prediction Response: {response_dict}")


@pytest.mark.weights
def test_predictions_segmentation(client, sample_amd_bytes):
    """Test the segmentation model (resnet34_unet) via the predict endpoint."""
    for image in sample_amd_bytes:
        _, image_file = image

        response = client.post(
            "api/v1/predict",
            files={"image": image_file},
            data={"model_id": "resnet34_unet"},
        )

        if response.status_code != 200:
            logger.error(response.text)
        assert response.status_code == 200

        response_dict = response.json()
        assert response_dict["status"] == "success"
        assert response_dict["error"] is None
        assert response_dict["result"]["metadata"]["inference_time_ms"] > 0

        predictions = response_dict["result"]["predictions"]
        assert isinstance(predictions, list)
        for prediction in predictions:
            assert "polygon" in prediction
            assert "area" in prediction
            assert "class_name" in prediction

        logger.info(f"Segmentation Prediction Response: {response_dict}")


def test_predictions_invalid_file_type(client):
    """Test error handling when file is not an image"""
    # Create a text file instead of image
    text_file = ("test.txt", io.BytesIO(b"not an image"), "text/plain")

    response = client.post(
        "api/v1/predict",
        files={"image": text_file},
        data={"model_id": "test_model"},
    )

    assert response.status_code == 200
    response_dict = response.json()
    assert response_dict["status"] == "error"
    assert response_dict["error"] == "400 - File must be an image"

    logger.info(f"Invalid file type response: {response_dict}")


def test_predictions_corrupted_image(client):
    """Test error handling when image is corrupted"""
    # Create corrupted image data
    corrupted_file = ("corrupt.jpg", io.BytesIO(b"not valid image data"), "image/jpeg")

    response = client.post(
        "api/v1/predict",
        files={"image": corrupted_file},
        data={"model_id": "test_model"},
    )

    assert response.status_code == 200
    response_dict = response.json()
    assert response_dict["status"] == "error"
    assert response_dict["error"].startswith("400 - Error loading image:")

    logger.info(f"Corrupted image response: {response_dict}")


def test_predictions_invalid_model_id(client, sample_bytes_images):
    """Test error handling when model_id doesn't exist"""
    _, image_file = sample_bytes_images[0]

    response = client.post(
        "api/v1/predict",
        files={"image": image_file},
        data={"model_id": "nonexistent_model"},
    )

    assert response.status_code == 200
    response_dict = response.json()
    assert response_dict["status"] == "error"
    assert response_dict["error"].startswith("500 - Prediction failed:")

    logger.info(f"Invalid model response: {response_dict}")
