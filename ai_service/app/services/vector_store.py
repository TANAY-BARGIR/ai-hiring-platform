"""
FAISS Vector Store Service.

Manages a single FAISS index for all resume embeddings.
Supports:
  - Adding new resume embeddings
  - Removing embeddings when a resume is deleted/replaced
  - Semantic search across all candidates
  - Persistence (save/load to disk)

Architecture decision: We use a single flat index (IndexFlatIP)
because our scale (hundreds to low thousands of resumes) doesn't
require approximate nearest neighbor methods. Inner product search
is used since nv-embedqa-e5-v5 embeddings are normalized.
"""

import json
import logging
import threading
from pathlib import Path

import faiss
import numpy as np

from app.config import settings
from .embeddings import EMBEDDING_DIMENSION

logger = logging.getLogger(__name__)

# Thread-safe singleton
_lock = threading.Lock()
_index: faiss.Index | None = None
_metadata: list[dict] = []  # Parallel list: metadata[i] corresponds to index vector i


def _get_paths() -> tuple[Path, Path]:
    """Get paths for FAISS index and metadata files."""
    base = Path(settings.FAISS_INDEX_PATH)
    base.mkdir(parents=True, exist_ok=True)
    return base / "resume.index", base / "resume_metadata.json"


def _load_or_create_index() -> tuple[faiss.Index, list[dict]]:
    """Load existing index from disk, or create a new one."""
    index_path, meta_path = _get_paths()

    if index_path.exists() and meta_path.exists():
        logger.info(f"Loading FAISS index from {index_path}")
        index = faiss.read_index(str(index_path))
        with open(meta_path, "r") as f:
            metadata = json.load(f)
        logger.info(f"Loaded {index.ntotal} vectors with {len(metadata)} metadata entries")
        return index, metadata

    logger.info("Creating new FAISS index (IndexFlatIP)")
    index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
    return index, []


def get_index() -> tuple[faiss.Index, list[dict]]:
    """Get the global FAISS index (thread-safe, lazy-loaded)."""
    global _index, _metadata
    with _lock:
        if _index is None:
            _index, _metadata = _load_or_create_index()
        return _index, _metadata


def save_index():
    """Persist the FAISS index and metadata to disk."""
    index, metadata = get_index()
    index_path, meta_path = _get_paths()

    with _lock:
        faiss.write_index(index, str(index_path))
        with open(meta_path, "w") as f:
            json.dump(metadata, f)

    logger.info(f"Saved FAISS index: {index.ntotal} vectors to {index_path}")


def add_embeddings(
    embeddings: np.ndarray,
    chunks_metadata: list[dict],
):
    """
    Add resume chunk embeddings to the FAISS index.

    Args:
        embeddings: numpy array of shape (n_chunks, EMBEDDING_DIMENSION)
        chunks_metadata: List of metadata dicts (one per chunk)
    """
    if embeddings.shape[0] == 0:
        logger.warning("No embeddings to add")
        return

    index, metadata = get_index()

    # Normalize for inner product search (cosine similarity)
    faiss.normalize_L2(embeddings)

    with _lock:
        index.add(embeddings)
        _metadata.extend(chunks_metadata)

    save_index()
    logger.info(
        f"Added {embeddings.shape[0]} vectors. "
        f"Index now has {index.ntotal} total vectors."
    )


def remove_resume_embeddings(resume_id: int):
    """
    Remove all embeddings for a specific resume.

    Since FAISS IndexFlatIP doesn't support deletion,
    we rebuild the index without the target resume's vectors.
    """
    global _index, _metadata
    index, metadata = get_index()

    if not metadata:
        return

    # Find indices to keep (not matching this resume_id)
    keep_indices = [
        i for i, m in enumerate(metadata)
        if m.get("resume_id") != resume_id
    ]

    if len(keep_indices) == len(metadata):
        logger.info(f"No embeddings found for resume {resume_id}")
        return

    removed_count = len(metadata) - len(keep_indices)

    with _lock:
        if keep_indices:
            # Reconstruct vectors for kept indices
            kept_vectors = np.array(
                [index.reconstruct(i) for i in keep_indices],
                dtype=np.float32,
            )
            kept_metadata = [metadata[i] for i in keep_indices]

            # Rebuild index
            new_index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
            new_index.add(kept_vectors)
            _index = new_index
            _metadata = kept_metadata
        else:
            # All removed — start fresh
            _index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
            _metadata = []

    save_index()
    logger.info(
        f"Removed {removed_count} vectors for resume {resume_id}. "
        f"Index now has {_index.ntotal} vectors."
    )


def search(
    query_embedding: np.ndarray,
    top_k: int = 10,
) -> list[dict]:
    """
    Search the FAISS index for similar resume chunks.

    Args:
        query_embedding: 1D numpy array of shape (EMBEDDING_DIMENSION,)
        top_k: Number of results to return.

    Returns:
        List of dicts with: score, text chunk metadata, candidate_id, resume_id
    """
    index, metadata = get_index()

    if index.ntotal == 0:
        logger.warning("FAISS index is empty — no results")
        return []

    # Reshape for FAISS (expects 2D)
    query = query_embedding.reshape(1, -1).astype(np.float32)
    faiss.normalize_L2(query)

    # Search
    actual_k = min(top_k, index.ntotal)
    scores, indices = index.search(query, actual_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(metadata):
            continue
        results.append({
            "score": float(score),
            **metadata[idx],
        })

    logger.info(
        f"Search returned {len(results)} results "
        f"(top score: {results[0]['score']:.4f})" if results else
        "Search returned 0 results"
    )
    return results
