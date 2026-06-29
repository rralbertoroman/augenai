FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

# Install system dependencies
# Combined update, install, and cleanup to reduce layer size
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Rust (needed for some python dependencies)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Set up environment
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_HTTP_TIMEOUT=600 \
    UV_LINK_MODE=copy

WORKDIR /app

# Copy project files
COPY pyproject.toml uv.lock ./

# Install Python dependencies without installing the project itself yet.
# `--group segmentation` pulls the private amd-biomarker model (resnet34_unet);
# the build needs SSH access to that repo (e.g. a mounted key / build secret).
RUN uv sync --all-extras --group segmentation --no-install-project

# Copy source code
COPY ./src ./src

# Install the project in editable mode
RUN uv pip install -e .

# Expose port
EXPOSE 8000

# Run the application in development mode
CMD ["uv", "run", "fastapi", "dev", "src/ai_service/main.py", "--host", "0.0.0.0", "--port", "8000", "--reload"]