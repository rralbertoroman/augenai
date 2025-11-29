"""Logging configuration for the AI Service."""

import logging
import sys
from typing import Optional

from .config import settings


def setup_logging(log_level: Optional[str] = None):
    """Setup FastAPI default logging configuration.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    log_level = log_level or ("DEBUG" if settings.debug else "INFO")

    # Clear existing handlers
    root_logger = logging.getLogger()
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Configure the root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        force=True,  # Override any existing handlers
        handlers=[logging.StreamHandler(sys.stdout)],  # Only use console
    )

    # Set log level for common libraries
    logging.getLogger("uvicorn").setLevel(log_level)
    logging.getLogger("uvicorn.error").setLevel(log_level)
    logging.getLogger("uvicorn.access").setLevel("INFO")
    logging.getLogger("urllib3").setLevel("WARNING")
    logging.getLogger("httpx").setLevel("WARNING")
    logging.getLogger("httpcore").setLevel("WARNING")
    logging.getLogger("PIL").setLevel("WARNING")
    logging.getLogger("watchfiles").setLevel("WARNING")  # Reduce watchfiles logs


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the given name."""
    return logging.getLogger(name)
