"""
Resume parsing router.

Receives processing triggers from Django, runs the full AI pipeline
as a background task, and sends results back via callback.

Pipeline: PDF → Text → Skills (LLM) → Chunks → Embeddings → FAISS
"""

import logging

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException

from app.config import settings
from app.schemas.parsing import ProcessResumeRequest
from app.callbacks.django_client import send_resume_callback
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.skill_extractor import extract_skills
from app.services.chunker import chunk_text
from app.services.embeddings import generate_embeddings
from app.services.vector_store import (
    add_embeddings,
    remove_resume_embeddings,
)

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
    Background task: Full AI resume processing pipeline.

    Steps:
      1. Extract text from PDF (PyMuPDF)
      2. Extract skills via LLM (Llama 3.1 70B / fallback regex)
      3. Chunk text for embeddings (LangChain splitter)
      4. Generate embeddings (nv-embedqa-e5-v5 / skipped if no API key)
      5. Update FAISS index
      6. Callback to Django with results
    """
    logger.info(
        f"[Pipeline Start] Resume {resume_id} for candidate {candidate_id} "
        f"(file: {file_path})"
    )

    try:
        # ============================================================
        # Step 1: PDF Text Extraction
        # ============================================================
        logger.info(f"[Step 1/5] Extracting text from PDF...")
        resume_text = extract_text_from_pdf(file_path)
        logger.info(f"[Step 1/5] ✓ Extracted {len(resume_text)} chars")

        # ============================================================
        # Step 2: LLM Skill Extraction
        # ============================================================
        logger.info(f"[Step 2/5] Extracting skills via LLM...")
        extracted_skills = extract_skills(resume_text)
        logger.info(
            f"[Step 2/5] ✓ Extracted {len(extracted_skills)} skills: "
            f"{[s['skill_name'] for s in extracted_skills[:5]]}"
        )

        # ============================================================
        # Step 3: Text Chunking
        # ============================================================
        logger.info(f"[Step 3/5] Chunking text...")
        chunks = chunk_text(resume_text, candidate_id, resume_id)
        logger.info(f"[Step 3/5] ✓ Created {len(chunks)} chunks")

        # ============================================================
        # Step 4 & 5: Embeddings + FAISS Index Update
        # ============================================================
        if settings.NVIDIA_EMBED_API_KEY:
            logger.info(f"[Step 4/5] Generating embeddings...")
            chunk_texts = [c["text"] for c in chunks]
            embeddings = generate_embeddings(chunk_texts)
            logger.info(f"[Step 4/5] ✓ Generated embeddings: {embeddings.shape}")

            # Remove old embeddings for this resume (if re-processing)
            logger.info(f"[Step 5/5] Updating FAISS index...")
            remove_resume_embeddings(resume_id)

            # Add new embeddings (include text in metadata for RAG retrieval)
            chunks_metadata = [
                {**c["metadata"], "text": c["text"]}
                for c in chunks
            ]
            add_embeddings(embeddings, chunks_metadata)
            logger.info(f"[Step 5/5] ✓ FAISS index updated")
        else:
            logger.warning(
                "[Step 4-5/5] Skipped — NVIDIA_EMBED_API_KEY not set. "
                "Skills extracted via fallback, but no embeddings/FAISS."
            )

        # ============================================================
        # Step 6: Callback to Django
        # ============================================================
        skill_dicts = [
            {"skill_name": s["skill_name"], "confidence": s["confidence"]}
            for s in extracted_skills
        ]

        await send_resume_callback(
            resume_id=resume_id,
            processing_status="READY",
            extracted_skills=skill_dicts,
        )

        logger.info(
            f"[Pipeline Complete] Resume {resume_id} ✓ "
            f"({len(extracted_skills)} skills, {len(chunks)} chunks)"
        )

    except FileNotFoundError as e:
        logger.error(f"[Pipeline Failed] Resume {resume_id}: {e}")
        await send_resume_callback(
            resume_id=resume_id,
            processing_status="FAILED",
            failure_reason=f"PDF not found: {file_path}",
        )

    except Exception as e:
        logger.error(f"[Pipeline Failed] Resume {resume_id}: {e}", exc_info=True)
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
