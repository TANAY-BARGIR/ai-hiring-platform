"""
Configuration for the AI microservice.

Loads settings from environment variables via pydantic-settings.
All config is centralized here — no scattered os.getenv() calls.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Reads from the project root .env file.
    """

    # ---- Database (read-only access to Django's PostgreSQL) ----
    DB_NAME: str = "hiring_platform"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # ---- Django callback ----
    DJANGO_CALLBACK_URL: str = "http://localhost:8000/api/internal"
    INTERNAL_API_TOKEN: str = "dev-internal-token-change-in-production"

    # ---- NVIDIA API ----
    NVIDIA_API_KEY: str = ""

    # ---- FAISS ----
    FAISS_INDEX_PATH: str = "faiss_index"

    model_config = {
        "env_file": "../.env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


# Singleton instance
settings = Settings()
