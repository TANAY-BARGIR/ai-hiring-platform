"""
Service layer for candidate operations that interact with FastAPI.

Keeps HTTP communication logic out of views — clean separation of concerns.
"""

import logging

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


def trigger_resume_processing(resume) -> bool:
    """
    Notify FastAPI to start processing a resume.

    Called after a resume is uploaded and saved to the shared volume.
    Returns True if FastAPI accepted the job, False otherwise.
    """
    url = f"{settings.AI_SERVICE_URL}/process-resume/"
    payload = {
        "candidate_id": resume.candidate.pk,
        "resume_id": resume.pk,
        "file_path": str(resume.file),
    }
    headers = {
        "X-Internal-Token": settings.INTERNAL_API_TOKEN,
        "Content-Type": "application/json",
    }

    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=10.0)

        if response.status_code == 202:
            logger.info(f"FastAPI accepted resume {resume.pk} for processing")
            # Update status to PROCESSING
            resume.processing_status = 'PROCESSING'
            resume.save(update_fields=['processing_status'])
            return True
        else:
            logger.error(
                f"FastAPI rejected resume {resume.pk}: "
                f"status={response.status_code}, body={response.text}"
            )
            return False

    except httpx.RequestError as e:
        logger.warning(
            f"Could not reach FastAPI for resume {resume.pk}: {e}. "
            f"Resume stays in PENDING state."
        )
        return False
