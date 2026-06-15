"""Pydantic schemas for the resume chat (RAG) endpoint."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Ask a question about a specific resume."""
    resume_id: int = Field(..., description="ID of the resume to query")
    question: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="Natural language question about the resume",
    )


class ChatResponse(BaseModel):
    """RAG-generated answer with source context."""
    resume_id: int
    question: str
    answer: str
    source_chunks: list[str] = Field(
        description="Resume excerpts used to generate the answer"
    )
    num_chunks_used: int
