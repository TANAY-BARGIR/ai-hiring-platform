"""
Service layer for hybrid search and resume chat.

Proxies requests to the FastAPI AI service, keeping the internal
communication pattern consistent — frontend never talks to FastAPI directly.
"""

import logging

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


def semantic_search(query: str, top_k: int = 10) -> list[dict]:
    """
    Call FastAPI's semantic search endpoint.

    Returns a list of dicts with candidate_id, resume_id, score.
    """
    url = f"{settings.AI_SERVICE_URL}/search/"
    payload = {"query": query, "top_k": top_k}
    headers = {
        "X-Internal-Token": settings.INTERNAL_API_TOKEN,
        "Content-Type": "application/json",
    }

    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=30.0)

        if response.status_code == 200:
            data = response.json()
            logger.info(
                f"Semantic search for '{query}': "
                f"{data.get('total_results', 0)} results"
            )
            return data.get("results", [])
        else:
            logger.error(
                f"Semantic search failed: status={response.status_code}, "
                f"body={response.text}"
            )
            return []

    except httpx.RequestError as e:
        logger.warning(f"Could not reach AI service for search: {e}")
        return []


def ask_resume(resume_id: int, question: str) -> dict:
    """
    Call FastAPI's RAG resume chat endpoint.

    Returns dict with answer, source_chunks, num_chunks_used.
    """
    url = f"{settings.AI_SERVICE_URL}/ask-resume/"
    payload = {"resume_id": resume_id, "question": question}
    headers = {
        "X-Internal-Token": settings.INTERNAL_API_TOKEN,
        "Content-Type": "application/json",
    }

    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=30.0)

        if response.status_code == 200:
            data = response.json()
            logger.info(
                f"Resume chat: resume={resume_id}, "
                f"chunks_used={data.get('num_chunks_used', 0)}"
            )
            return data
        else:
            logger.error(
                f"Resume chat failed: status={response.status_code}, "
                f"body={response.text}"
            )
            return {
                "answer": "Failed to get an answer from the AI service.",
                "source_chunks": [],
                "num_chunks_used": 0,
            }

    except httpx.RequestError as e:
        logger.warning(f"Could not reach AI service for chat: {e}")
        return {
            "answer": "AI service is currently unavailable.",
            "source_chunks": [],
            "num_chunks_used": 0,
        }
