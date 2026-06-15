"""
RAG (Retrieval-Augmented Generation) Pipeline.

Answers natural language questions about a specific resume by:
  1. Retrieving relevant chunks from FAISS
  2. Feeding them as context to an LLM
  3. Generating a grounded answer with source attribution

This is the core "Ask Resume" feature — lets recruiters chat
with a candidate's resume instead of reading it manually.
"""

import logging

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

# Uses the CHAT model (8B) — fast responses for conversational Q&A
client = None


def _get_client() -> OpenAI:
    """Lazy-initialize the NVIDIA API client for RAG chat."""
    global client
    if client is None:
        if not settings.NVIDIA_CHAT_API_KEY:
            raise ValueError(
                "NVIDIA_CHAT_API_KEY is not set. Cannot perform RAG chat."
            )
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.NVIDIA_CHAT_API_KEY,
        )
    return client


RAG_SYSTEM_PROMPT = """You are an AI hiring assistant analyzing a candidate's resume.
Answer the recruiter's question based ONLY on the provided resume excerpts.

Rules:
1. If the answer is clearly in the provided context, answer confidently.
2. If the answer is partially present, say what you found and what's missing.
3. If the context doesn't contain relevant information, say "This information is not present in the resume."
4. NEVER fabricate skills, experience, or qualifications.
5. Be concise and professional. Use bullet points for lists."""


RAG_USER_PROMPT = """Resume excerpts (retrieved from FAISS):
---
{context}
---

Recruiter's question: {question}

Answer:"""


def generate_rag_answer(
    question: str,
    context_chunks: list[str],
) -> str:
    """
    Generate an answer using retrieved resume chunks as context.

    Args:
        question: The recruiter's natural language question.
        context_chunks: List of resume text chunks from FAISS retrieval.

    Returns:
        Generated answer string.
    """
    if not context_chunks:
        return "No relevant resume content found to answer this question."

    # Join chunks with separators for clear context boundaries
    context = "\n\n---\n\n".join(context_chunks)

    try:
        llm = _get_client()

        response = llm.chat.completions.create(
            model=settings.CHAT_MODEL,
            messages=[
                {"role": "system", "content": RAG_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": RAG_USER_PROMPT.format(
                        context=context,
                        question=question,
                    ),
                },
            ],
            temperature=0.3,  # Slightly creative but still grounded
            max_tokens=512,
        )

        answer = response.choices[0].message.content.strip()
        logger.info(
            f"RAG answer generated: {len(answer)} chars "
            f"from {len(context_chunks)} chunks"
        )
        return answer

    except ValueError:
        raise  # API key not set

    except Exception as e:
        logger.error(f"RAG generation failed: {e}")
        raise
