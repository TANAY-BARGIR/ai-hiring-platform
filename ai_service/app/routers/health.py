"""
Health check router.

Provides basic service health and database connectivity checks.
Used by Django to verify FastAPI is alive before sending work.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Basic health check — confirms the service is running."""
    return {
        "status": "healthy",
        "service": "ai-hiring-platform",
        "version": "0.1.0",
    }


@router.get("/health/db")
def health_check_db(db: Session = Depends(get_db)):
    """
    Database connectivity check.
    Verifies FastAPI can read from Django's PostgreSQL.
    """
    try:
        result = db.execute(text("SELECT 1")).scalar()
        return {
            "status": "healthy",
            "database": "connected",
            "result": result,
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
        }
