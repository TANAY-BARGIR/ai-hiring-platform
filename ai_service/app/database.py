"""
Read-only database connection to Django's PostgreSQL.

FastAPI reads candidate/resume metadata directly from PostgreSQL
(saving a network hop vs. calling Django's API). This connection
uses the same database but should use a read-only user in production.
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker

from .config import settings

# Create engine — read-only intent
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Reflect Django's tables (we don't define models — Django owns the schema)
metadata = MetaData()


def get_db():
    """Dependency: yields a database session, auto-closes on completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
