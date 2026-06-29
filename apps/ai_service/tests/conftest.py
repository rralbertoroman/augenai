import io
import logging
import os
from pathlib import Path
from typing import List

import pytest
from PIL import Image

logger = logging.getLogger(__name__)


def pytest_addoption(parser):
    parser.addoption(
        "--skip-weights",
        action="store_true",
        default=False,
        help="Skip tests marked 'weights' (model-weight-dependent) — used on CI with no weights.",
    )


def pytest_configure(config):
    config.addinivalue_line("markers", "weights: requires model weight files on disk")


def pytest_collection_modifyitems(config, items):
    if not config.getoption("--skip-weights"):
        return
    skip = pytest.mark.skip(
        reason="weight-dependent; skipped via --skip-weights (CI has no model weights)"
    )
    for item in items:
        if "weights" in item.keywords:
            item.add_marker(skip)


@pytest.fixture
def sample_bytes_images():
    image_dir = "tests/dr_sample"
    image_extensions = {".jpg", ".jpeg", ".png", ".bmp"}

    if not os.path.exists(image_dir):
        pytest.skip(f"Image directory not found: {image_dir}")

    upload_files = []

    for fname in os.listdir(image_dir):
        path = Path(image_dir) / fname
        ext = path.suffix.lower()

        if ext in image_extensions:
            try:
                # Read file exactly as stored on disk
                raw = path.read_bytes()

                # Wrap as a file tuple suitable for TestClient
                file_like = io.BytesIO(raw)
                mime = f"image/{ext.lstrip('.')}" if ext != ".jpg" else "image/jpeg"

                upload_files.append(("image", (fname, file_like, mime)))

            except Exception as e:
                print(f"Error reading image {path}: {e}")

    if not upload_files:
        pytest.skip(f"No valid images found in {image_dir}")

    return upload_files


@pytest.fixture
def sample_glaucoma() -> List[Image.Image]:
    image_dir = "tests/glaucoma-sample"
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


@pytest.fixture
def sample_amd() -> List[Image.Image]:
    image_dir = "tests/amd-sample"
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


@pytest.fixture
def sample_amd_bytes():
    image_dir = "tests/amd-sample"
    image_extensions = {".jpg", ".jpeg", ".png", ".bmp"}

    if not os.path.exists(image_dir):
        pytest.skip(f"Image directory not found: {image_dir}")

    upload_files = []

    for fname in os.listdir(image_dir):
        path = Path(image_dir) / fname
        ext = path.suffix.lower()

        if ext in image_extensions:
            try:
                # Read file exactly as stored on disk
                raw = path.read_bytes()

                # Wrap as a file tuple suitable for TestClient
                file_like = io.BytesIO(raw)
                mime = f"image/{ext.lstrip('.')}" if ext != ".jpg" else "image/jpeg"

                upload_files.append(("image", (fname, file_like, mime)))

            except Exception as e:
                print(f"Error reading image {path}: {e}")

    if not upload_files:
        pytest.skip(f"No valid images found in {image_dir}")

    return upload_files


@pytest.fixture
def sample_images() -> List[Image.Image]:
    """
    Fixture that loads sample images from a directory.

    Returns:
        List[Image.Image]: List of PIL Image objects
    """
    # You can change this path to point to your actual image directory
    image_dir = "tests/dr_sample"
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
