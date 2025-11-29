"""Health check endpoints"""

from fastapi import APIRouter

from ai_service.logging_config import get_logger

router = APIRouter(tags=["health"])
logger = get_logger(__name__)


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-service",
    }


@router.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    return {
        "status": "ready",
        "service": "ai-service",
    }
