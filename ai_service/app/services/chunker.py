"""
Text Chunking Service.

Splits resume text into overlapping chunks for embedding generation.
Uses LangChain's RecursiveCharacterTextSplitter — the industry standard
for RAG pipelines.

Why chunking matters:
  - Embedding models have token limits (~512 tokens for nv-embedqa-e5-v5)
  - Smaller chunks = more precise semantic search results
  - Overlap ensures context isn't lost at chunk boundaries
"""

import logging

from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

# Optimized for resume-length documents (1-3 pages)
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,       # ~125 tokens per chunk
    chunk_overlap=50,     # 10% overlap for context continuity
    length_function=len,
    separators=["\n\n", "\n", ". ", " ", ""],
)


def chunk_text(text: str, candidate_id: int, resume_id: int) -> list[dict]:
    """
    Split resume text into chunks with metadata.

    Each chunk includes:
      - text: The chunk content
      - metadata: candidate_id, resume_id, chunk_index (for traceability)

    Args:
        text: Full resume text.
        candidate_id: Owner of the resume.
        resume_id: Resume identifier.

    Returns:
        List of dicts with text and metadata.
    """
    chunks = splitter.split_text(text)

    result = [
        {
            "text": chunk,
            "metadata": {
                "candidate_id": candidate_id,
                "resume_id": resume_id,
                "chunk_index": i,
            },
        }
        for i, chunk in enumerate(chunks)
    ]

    logger.info(
        f"Chunked resume {resume_id}: {len(text)} chars → {len(result)} chunks "
        f"(avg {len(text) // max(len(result), 1)} chars/chunk)"
    )
    return result
