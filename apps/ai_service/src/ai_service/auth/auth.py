"""Authentication utilities"""

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from ..config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)) -> str:
    """
    Verify the API key from the request header.

    Args:
        api_key: The API key from the X-API-Key header

    Returns:
        The verified API key

    Raises:
        HTTPException: If the API key is missing or invalid
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    if not settings.ai_prediction_service_secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API Key not configured on server",
        )

    if api_key != settings.ai_prediction_service_secret_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key",
        )

    return api_key
