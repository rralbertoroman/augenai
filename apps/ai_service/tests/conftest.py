import logging
import os
from pathlib import Path
from typing import List

import pytest
from PIL import Image

logger = logging.getLogger(__name__)

@pytest.fixture
def sample_images() -> List[Image.Image]:
    """
    Fixture that loads sample images from a directory.

    Returns:
        List[Image.Image]: List of PIL Image objects
    """
    # You can change this path to point to your actual image directory
    image_dir = "tests/data/dr_sample"
    image_extensions = {".jpg", ".jpeg", ".png", ".bmp"}

    if not os.path.exists(image_dir):
        pytest.skip(f"Image directory not found: {image_dir}")

    images = []
    for file in os.listdir(image_dir):
        file_path = Path(image_dir) / file
        if file_path.suffix.lower() in image_extensions:
            try:
                img = Image.open(file_path)
                images.append(img)
            except Exception as e:
                print(f"Error loading image {file_path}: {e}")

    if not images:
        pytest.skip(f"No valid images found in {image_dir}")

    return images
