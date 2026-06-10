"""
Resume parsing router.

Receives processing triggers from Django, runs background tasks,
and sends results back via callback.
"""

import logging

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException

from app.config import settings
from app.schemas.parsing import ProcessResumeRequest
from app.callbacks.django_client import send_resume_callback

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/process-resume", tags=["Resume Processing"])


def verify_internal_token(x_internal_token: str = Header(...)):
    """Dependency: verify the shared secret for internal service calls."""
    if x_internal_token != settings.INTERNAL_API_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid internal token")


async def _process_resume_task(
    candidate_id: int,
    resume_id: int,
    file_path: str,
):
    """
    Background task: processes a resume file.

    Current implementation is a STUB — it simulates processing
    and returns dummy skills. Will be replaced with real AI pipeline
    (PDF extraction → skill extraction → embeddings → FAISS) in Phase 3.
    """
    logger.info(
        f"Processing resume {resume_id} for candidate {candidate_id} "
        f"(file: {file_path})"
    )

    try:
        # ============================================================
        # STUB: Simulate processing
        # In Phase 2/3, this will be replaced with:
        # 1. PDF text extraction (PyMuPDF)
        # 2. Skill extraction (LLM — Llama 3.1 70B via NVIDIA API)
        # 3. Embedding generation (nv-embedqa-e5-v5)
        # 4. FAISS index update
        # ============================================================
        dummy_skills = [
            {"skill_name": "Python", "confidence": 0.95},
            {"skill_name": "Django", "confidence": 0.90},
            {"skill_name": "REST APIs", "confidence": 0.85},
        ]

        # Send results back to Django
        await send_resume_callback(
            resume_id=resume_id,
            processing_status="READY",
            extracted_skills=dummy_skills,
        )
        logger.info(f"Resume {resume_id} processed successfully (stub)")

    except Exception as e:
        logger.error(f"Resume {resume_id} processing failed: {e}")
        await send_resume_callback(
            resume_id=resume_id,
            processing_status="FAILED",
            failure_reason=str(e),
        )


@router.post("/", status_code=202)
async def process_resume(
    request: ProcessResumeRequest,
    background_tasks: BackgroundTasks,
    x_internal_token: str = Header(...),
):
    """
    Trigger resume processing.

    Called by Django after a resume upload. Immediately returns 202 Accepted,
    then processes in the background. Results are sent back via callback.
    """
    verify_internal_token(x_internal_token)

    background_tasks.add_task(
        _process_resume_task,
        candidate_id=request.candidate_id,
        resume_id=request.resume_id,
        file_path=request.file_path,
    )

    return {
        "status": "accepted",
        "message": f"Resume {request.resume_id} queued for processing",
    }
