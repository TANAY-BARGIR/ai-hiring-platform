"""Pydantic schemas for the resume parsing pipeline."""

from pydantic import BaseModel


class ProcessResumeRequest(BaseModel):
    """Request from Django to trigger resume processing."""
    candidate_id: int
    resume_id: int
    file_path: str  # Relative path within shared media volume


class ExtractedSkillSchema(BaseModel):
    """A single extracted skill with confidence score."""
    skill_name: str
    confidence: float = 1.0


class ProcessResumeCallback(BaseModel):
    """Callback payload sent back to Django after processing."""
    processing_status: str  # "READY" or "FAILED"
    extracted_skills: list[ExtractedSkillSchema] = []
    failure_reason: str = ""
