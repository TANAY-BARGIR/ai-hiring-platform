# ==============================================================================
# Django Backend — Multi-stage Dockerfile
# ==============================================================================
# Stage 1: Base with dependencies (cached layer)
# Stage 2: Application code (changes frequently)
# ==============================================================================

# ---- Stage 1: Dependencies ----
FROM python:3.12-slim AS base

# Prevent Python from buffering stdout/stderr (important for Docker logs)
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

# Create media directory for resume uploads (Docker volume mount point)
RUN mkdir -p /app/media/resumes

# Collect static files for admin panel
RUN DJANGO_SETTINGS_MODULE=config.settings.production \
    DJANGO_SECRET_KEY=build-time-secret \
    python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

# Default command — Gunicorn for production, runserver for dev
# Override in docker-compose for development
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--timeout", "120"]
