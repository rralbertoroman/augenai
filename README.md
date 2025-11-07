# AugenAI

## Prerequisites

1. Install Python 3.10+

2. Install uv

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
