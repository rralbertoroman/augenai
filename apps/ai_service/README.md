# AI Service

A FastAPI application for AI-powered image predictions.

## Features

- Image classification and detection
- Multiple AI models support
- RESTful API endpoints
- File upload support

## Endpoints

### Health Checks

- `GET /health` - Health check
- `GET /ready` - Readiness check

### Prediction

- `POST /api/v1/predictions/predict` - Make a prediction using a model and image
- `GET /api/v1/predictions/models` - List available models

### Items (Example CRUD endpoints)

- `GET /api/v1/items` - Get all items
- `GET /api/v1/items/{id}` - Get a specific item
- `POST /api/v1/items` - Create a new item
- `PUT /api/v1/items/{id}` - Update an item
- `DELETE /api/v1/items/{id}` - Delete an item

## Prediction Endpoint Usage

The main prediction endpoint accepts two parameters:

1. `model_id` (form data) - The ID of the model to use for prediction
2. `image` (file) - The image file to analyze

Example request using curl:

```bash
curl -X POST "http://localhost:8000/api/v1/predictions/predict" \
  -F "model_id=model_v1" \
  -F "image=@path/to/your/image.jpg"
```

## Running the Application

### Prerequisites

- Python 3.10+
- uv (for dependency management)

### Installation

1. Install dependencies:

```bash
uv sync
```

### Development

Run the application in development mode with hot-reloading:

```bash
uv run fastapi dev src/ai_service/main.py
```

Or using npm scripts if available:
```bash
npm run dev
```

### Production

For production deployment, run using uvicorn:

```bash
uv run uvicorn src.ai_service.main:app --host 0.0.0.0 --port 8000
```

The application will be available at `http://localhost:8000`.

API documentation will be available at `http://localhost:8000/docs`.