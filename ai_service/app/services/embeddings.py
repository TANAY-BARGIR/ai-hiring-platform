"""
Embedding Generation Service.

Uses NVIDIA's nv-embedqa-e5-v5 model via the OpenAI-compatible API
to generate dense vector embeddings for resume chunks.

These embeddings are stored in FAISS for semantic search:
  "Find me candidates with Django + PostgreSQL experience"
  → Query is embedded → FAISS finds nearest resume chunks
"""

import logging

import numpy as np
from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

client = None

# nv-embedqa-e5-v5 produces 1024-dimensional embeddings
EMBEDDING_DIMENSION = 1024


def _get_client() -> OpenAI:
    """Lazy-initialize the NVIDIA API client for embeddings."""
    global client
    if client is None:
        if not settings.NVIDIA_EMBED_API_KEY:
            raise ValueError("NVIDIA_EMBED_API_KEY is not set.")
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.NVIDIA_EMBED_API_KEY,
        )
    return client


def generate_embeddings(texts: list[str]) -> np.ndarray:
    """
    Generate embeddings for a list of text chunks.

    Args:
        texts: List of text strings to embed.

    Returns:
        numpy array of shape (len(texts), EMBEDDING_DIMENSION).

    Raises:
        ValueError: If NVIDIA_EMBED_API_KEY is not configured.
    """
    if not texts:
        return np.array([], dtype=np.float32).reshape(0, EMBEDDING_DIMENSION)

    try:
        llm = _get_client()

        # NVIDIA API supports batch embedding
        response = llm.embeddings.create(
            input=texts,
            model=settings.EMBED_MODEL,
            encoding_format="float",
            extra_body={"input_type": "passage", "truncate": "END"},
        )

        embeddings = [item.embedding for item in response.data]
        result = np.array(embeddings, dtype=np.float32)

        logger.info(
            f"Generated {len(texts)} embeddings, shape: {result.shape}"
        )
        return result

    except ValueError:
        raise  # Re-raise API key errors

    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        raise


def generate_query_embedding(query: str) -> np.ndarray:
    """
    Generate a single embedding for a search query.

    Uses input_type="query" for asymmetric search (different from passage).
    """
    llm = _get_client()

    response = llm.embeddings.create(
        input=[query],
        model=settings.EMBED_MODEL,
        encoding_format="float",
        extra_body={"input_type": "query", "truncate": "END"},
    )

    embedding = np.array(response.data[0].embedding, dtype=np.float32)
    logger.info(f"Generated query embedding, shape: {embedding.shape}")
    return embedding
