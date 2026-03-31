# Use official lightweight Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies (needed for some wheels if required)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv (Fast and modern)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependencies list
COPY requirements.txt .

# Install dependencies using uv into the system (Docker is isolated)
RUN uv pip install --system -r requirements.txt

# Copy application code
COPY . .

# Expose port (FastAPI default is usually 8000)
EXPOSE 8000

# Command to run (Using uvicorn)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
