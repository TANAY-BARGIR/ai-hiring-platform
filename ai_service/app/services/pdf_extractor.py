"""
PDF Text Extraction Service.

Uses PyMuPDF (fitz) to extract raw text from uploaded resume PDFs.
This is the first step of the AI pipeline:
  PDF → Raw Text → LLM Skill Extraction → Embeddings → FAISS
"""

import logging
from pathlib import Path

import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract all text from a PDF file.

    Args:
        file_path: Path to the PDF file (relative to media root or absolute).

    Returns:
        Extracted text as a single string. Pages separated by newlines.

    Raises:
        FileNotFoundError: If the PDF file doesn't exist.
        ValueError: If no text could be extracted.
    """
    path = Path(file_path)

    # Also check in the media mount directory (Docker volume)
    if not path.exists():
        media_path = Path("/app/media") / file_path
        if media_path.exists():
            path = media_path
        else:
            raise FileNotFoundError(f"PDF not found: {file_path}")

    logger.info(f"Extracting text from: {path}")

    text_parts = []
    with fitz.open(str(path)) as doc:
        for page_num, page in enumerate(doc, 1):
            page_text = page.get_text("text")
            if page_text.strip():
                text_parts.append(page_text)
            logger.debug(f"Page {page_num}: {len(page_text)} chars extracted")

    full_text = "\n".join(text_parts).strip()

    if not full_text:
        raise ValueError(f"No text extracted from PDF: {file_path}")

    logger.info(
        f"Extracted {len(full_text)} chars from {len(text_parts)} pages "
        f"({path.name})"
    )
    return full_text
