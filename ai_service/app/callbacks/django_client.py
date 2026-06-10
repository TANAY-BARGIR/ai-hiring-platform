"""
HTTP client for calling back to Django's internal API.

After processing a resume, FastAPI sends the results
(extracted skills, status update) back to Django via PATCH.
"""

import httpx
import logging

from app.config import settings

logger = logging.getLogger(__name__)


async def send_resume_callback(
    resume_id: int,
    processing_status: str,
    extracted_skills: list[dict] | None = None,
    failure_reason: str = "",
) -> bool:
    """
    Send resume processing results back to Django.

    Args:
        resume_id: The resume ID in Django's database
        processing_status: "READY" or "FAILED"
        extracted_skills: List of {"skill_name": str, "confidence": float}
        failure_reason: Error message if processing failed

    Returns:
        True if callback succeeded, False otherwise
    """
    url = f"{settings.DJANGO_CALLBACK_URL}/resumes/{resume_id}/callback/"
    payload = {
        "processing_status": processing_status,
        "extracted_skills": extracted_skills or [],
        "failure_reason": failure_reason,
    }
    headers = {
        "X-Internal-Token": settings.INTERNAL_API_TOKEN,
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.patch(url, json=payload, headers=headers)

        if response.status_code == 200:
            logger.info(f"Callback success for resume {resume_id}: {processing_status}")
            return True
        else:
            logger.error(
                f"Callback failed for resume {resume_id}: "
                f"status={response.status_code}, body={response.text}"
            )
            return False

    except httpx.RequestError as e:
        logger.error(f"Callback connection error for resume {resume_id}: {e}")
        return False
