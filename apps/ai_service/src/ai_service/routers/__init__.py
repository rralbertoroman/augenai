"""API Routers"""

from . import health as health
from .health import router as health_router
from .api import router as api_router
from .predictions import router as predictions_router

__all__ = ["health_router", "api_router", "predictions_router", "predictions"]
