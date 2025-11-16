import logging

logger = logging.getLogger(__name__)


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
