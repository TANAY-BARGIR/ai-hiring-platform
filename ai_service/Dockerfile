# ==============================================================================
# FastAPI AI Service — Multi-stage Dockerfile
# ==============================================================================
# Stage 1: Base with dependencies (cached layer)
# Stage 2: Application code (changes frequently)
# ==============================================================================

# ---- Stage 1: Dependencies ----
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# ---- Stage 2: Application ----
FROM base AS application

WORKDIR /app

# Copy application code
COPY . .

# Create directories for FAISS index and shared media
RUN mkdir -p /app/faiss_index /app/media

EXPOSE 8001

# Default command — Uvicorn
CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8001", \
     "--workers", "2"]
