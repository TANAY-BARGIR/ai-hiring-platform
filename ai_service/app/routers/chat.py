"""
Resume Chat Router (RAG-based Q&A).

Lets recruiters ask natural language questions about a candidate's resume:
  "Does this candidate have microservices experience?"
  "What databases has this person worked with?"

Flow:
  1. Find all FAISS chunks belonging to the requested resume_id
  2. Use the question to find the most relevant chunks (re-ranking)
  3. Feed top chunks + question to LLM → generate grounded answer
  4. Return answer + source chunks for transparency
"""

import logging

from fastapi import APIRouter, Header, HTTPException

from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.embeddings import generate_query_embedding
from app.services.vector_store import search
from app.services.rag_pipeline import generate_rag_answer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ask-resume", tags=["Resume Chat (RAG)"])


@router.post("/", response_model=ChatResponse)
async def ask_resume(
    request: ChatRequest,
    x_internal_token: str = Header(...),
):
    """
    Ask a question about a specific resume using RAG.

    The system retrieves relevant resume chunks from FAISS,
    then uses LLM to generate a contextually grounded answer.
    """
    if x_internal_token != settings.INTERNAL_API_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid internal token")

    if not settings.NVIDIA_CHAT_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Resume chat unavailable — NVIDIA_CHAT_API_KEY not configured",
        )

    if not settings.NVIDIA_EMBED_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Resume chat unavailable — NVIDIA_EMBED_API_KEY not configured",
        )

    try:
        # Step 1: Embed the question
        query_embedding = generate_query_embedding(request.question)

        # Step 2: Search FAISS for relevant chunks
        # Fetch more results, then filter to this resume only
        raw_results = search(query_embedding, top_k=50)

        # Filter to only chunks from the requested resume
        resume_chunks = [
            r for r in raw_results
            if r.get("resume_id") == request.resume_id
        ]

        if not resume_chunks:
            return ChatResponse(
                resume_id=request.resume_id,
                question=request.question,
                answer="No indexed content found for this resume. "
                       "The resume may not have been processed yet.",
                source_chunks=[],
                num_chunks_used=0,
            )

        # Step 3: Take top 5 most relevant chunks for context
        top_chunks = resume_chunks[:5]
        chunk_texts = [r.get("text", "") for r in top_chunks if r.get("text")]

        # If FAISS metadata doesn't have text, fall back
        if not chunk_texts:
            return ChatResponse(
                resume_id=request.resume_id,
                question=request.question,
                answer="Resume chunks are indexed but text content "
                       "is not available for RAG. Please re-process the resume.",
                source_chunks=[],
                num_chunks_used=0,
            )

        # Step 4: Generate RAG answer
        answer = generate_rag_answer(
            question=request.question,
            context_chunks=chunk_texts,
        )

        logger.info(
            f"RAG chat: resume={request.resume_id}, "
            f"question='{request.question[:50]}...', "
            f"chunks_used={len(chunk_texts)}"
        )

        return ChatResponse(
            resume_id=request.resume_id,
            question=request.question,
            answer=answer,
            source_chunks=chunk_texts,
            num_chunks_used=len(chunk_texts),
        )

    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    except Exception as e:
        logger.error(f"RAG chat failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
