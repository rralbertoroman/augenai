"""Regression test for the segmentation polygon coordinate space.

Segmentation polygons (and their area) must be returned in the ORIGINAL image's
pixel space, not the model's 512x512 input space — otherwise the frontend, which
scales points by displayed/natural size, renders the masks far too small.

This locks the contract via the pure scaling helper, so it runs in CI without
the `amd_biomarker` package or model weights (unlike the factory tests).
"""

from ai_service.services.prediction.factories.segmentation import (
    IMG_SIZE,
    rescale_polygon_to_original,
)


def test_scales_corner_point_and_area_to_original_dimensions():
    # 512x512 model space -> 1024x768 original: sx=2, sy=1.5
    points, area = rescale_polygon_to_original(
        [[IMG_SIZE, IMG_SIZE]], 100.0, (1024, 768)
    )
    assert points == [[1024.0, 768.0]]
    assert area == 300.0  # 100 * 2 * 1.5


def test_origin_and_midpoint():
    points, _ = rescale_polygon_to_original([[0, 0], [256, 256]], 0.0, (1024, 768))
    assert points == [[0.0, 0.0], [512.0, 384.0]]


def test_square_original_is_identity():
    points, area = rescale_polygon_to_original(
        [[10, 20], [300, 400]], 55.0, (IMG_SIZE, IMG_SIZE)
    )
    assert points == [[10.0, 20.0], [300.0, 400.0]]
    assert area == 55.0


def test_all_points_stay_within_original_bounds():
    width, height = 900, 600
    points, _ = rescale_polygon_to_original(
        [[0, 0], [IMG_SIZE, IMG_SIZE]], 1.0, (width, height)
    )
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    assert min(xs) >= 0 and max(xs) <= width
    assert min(ys) >= 0 and max(ys) <= height
    # Proves it left 512 space: max x reaches the original width.
    assert max(xs) == width
