"""Main FastAPI application entry point"""

import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .logging_config import setup_logging, get_logger
from .routers import api, health

# Setup logging
setup_logging()

logger = get_logger(__name__)

app = FastAPI(
    title="AI Service",
    description="A simple FastAPI application for AI services",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Log request
    logger.info(
        "Request started",
        extra={
            "method": request.method,
            "url": str(request.url),
            "headers": dict(request.headers),
            "query_params": dict(request.query_params),
        },
    )

    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(
            "Request failed",
            extra={
                "error": str(e),
                "traceback": str(e.__traceback__),
            },
            exc_info=True,
        )
        response = JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    # Calculate process time
    process_time = (time.time() - start_time) * 1000
    process_time = round(process_time, 2)

    # Log response
    logger.info(
        "Request completed",
        extra={
            "status_code": response.status_code,
            "process_time_ms": process_time,
        },
    )

    # Add process time to response headers
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(api.router, prefix="/api/v1", tags=["api"])

# Log application startup
event_logger = get_logger("ai_service.events")


@app.on_event("startup")
async def startup_event():
    """Log application startup"""
    event_logger.info("Application startup")


@app.on_event("shutdown")
async def shutdown_event():
    """Log application shutdown"""
    event_logger.info("Application shutdown")


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint"""
    logger.info("Root endpoint accessed")
    return {
        "message": "Welcome to AI Service",
        "version": "0.1.0",
        "docs": "/docs",
    }
