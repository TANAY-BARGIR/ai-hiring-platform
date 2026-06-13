"""Pydantic schemas for the semantic search endpoint."""

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Search query from a recruiter."""
    query: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Natural language search query, e.g. 'Django developer with PostgreSQL experience'",
    )
    top_k: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Number of results to return",
    )


class SearchResult(BaseModel):
    """A single search result with candidate info."""
    candidate_id: int
    resume_id: int
    chunk_index: int
    score: float = Field(description="Cosine similarity score (0.0 to 1.0)")


class SearchResponse(BaseModel):
    """Full search response."""
    query: str
    results: list[SearchResult]
    total_results: int
