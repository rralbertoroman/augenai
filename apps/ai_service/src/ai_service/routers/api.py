"""Main API endpoints"""

from fastapi import APIRouter

from . import predictions

router = APIRouter(tags=["api"])

# Include sub-routers
router.include_router(predictions.router, tags=["predictions"])
