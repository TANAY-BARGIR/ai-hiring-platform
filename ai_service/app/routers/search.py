"""
Semantic Search Router.

Provides natural language search over indexed resume embeddings.
Recruiters can query like:
  "Python developer with 3 years Django experience"
  "Machine learning engineer familiar with PyTorch"

The query is embedded → FAISS finds the most similar resume chunks
→ results are returned with candidate IDs and similarity scores.
"""

import logging

from fastapi import APIRouter, Header, HTTPException

from app.config import settings
from app.schemas.search import SearchRequest, SearchResponse, SearchResult
from app.services.embeddings import generate_query_embedding
from app.services.vector_store import search

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/search", tags=["Semantic Search"])


@router.post("/", response_model=SearchResponse)
async def semantic_search(
    request: SearchRequest,
    x_internal_token: str = Header(...),
):
    """
    Search resumes using natural language.

    The query is embedded using the same model as the stored resume chunks,
    then FAISS finds the nearest vectors (most semantically similar chunks).
    Results are grouped by candidate_id for deduplication.
    """
    if x_internal_token != settings.INTERNAL_API_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid internal token")

    if not settings.NVIDIA_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Semantic search unavailable — NVIDIA_API_KEY not configured",
        )

    try:
        # Generate query embedding
        query_embedding = generate_query_embedding(request.query)

        # Search FAISS index
        raw_results = search(query_embedding, top_k=request.top_k)

        # Format results
        results = [
            SearchResult(
                candidate_id=r["candidate_id"],
                resume_id=r["resume_id"],
                chunk_index=r.get("chunk_index", 0),
                score=r["score"],
            )
            for r in raw_results
        ]

        logger.info(
            f"Search for '{request.query}' → {len(results)} results"
        )

        return SearchResponse(
            query=request.query,
            results=results,
            total_results=len(results),
        )

    except Exception as e:
        logger.error(f"Search failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
