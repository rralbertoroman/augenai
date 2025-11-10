# AugenAI

## Prerequisites

1. Install Python 3.10+
2. Install uv
3. Docker Desktop (with WSL2 backend on Windows) with Docker Compose v2+ (for containerized deployment)

## Installation

1. Install the AI service dependencies using uv. The virtual environment will be created automatically by uv:

   ```bash
   cd apps/ai-service
   uv sync
   ```

2. Go to the project root directory and install the rest of the dependencies by running:

   ```bash
   cd ../..
   pnpm install
   ```

At this point, you should have the project installed and ready to run.

## Running the system

### Development

Run the development version of the system with hot-reloading:

   ```bash
   pnpm run dev
   ```

Or you can run the AI service directly using uv from the project root directory:

   ```bash
   cd apps/ai-service && uv run fastapi dev src/ai_service/main.py
   ```

### Production

For production deployment, run using uvicorn:

   ```bash
   cd apps/ai-service && uv run uvicorn src.ai_service.main:app --host 0.0.0.0 --port 8000
   ```

## Docker Setup

This monorepo uses Docker Compose to manage services and handle dependencies like Rust for the AI service.

### Services

- `ai-service`: FastAPI application with AI capabilities (requires Rust for PyTorch/Transformers)
- `web`: Next.js web application

### Quick Start

1. Build and start all services:
   ```bash
   pnpm run docker:dev
   # or directly:
   docker-compose up --build
   ```

2. Access the services:
   - AI Service: http://localhost:8000
   - AI Service Docs: http://localhost:8000/docs
   - Web App: http://localhost:3000

### Development with Docker

For development with hot-reloading:
```bash
docker-compose up --build
```

The source code is mounted as a volume, so changes will be reflected immediately.

### Production Build with Docker

To build for production:
```bash
pnpm run docker:prod
# or directly:
docker-compose -f docker-compose.prod.yml up --build
```

### Notes

- Rust is automatically installed in the Docker image for AI dependencies
- The nest-api service has been excluded as planned for deletion
- Dependencies are managed through uv package manager
- The web service depends on the ai-service and will start after it
