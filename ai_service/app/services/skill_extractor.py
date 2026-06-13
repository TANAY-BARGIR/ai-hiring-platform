"""
LLM-based Skill Extraction Service.

Uses NVIDIA API (OpenAI-compatible) with Llama 3.1 70B to extract
structured skills from raw resume text. This demonstrates:
  1. Prompt engineering for structured output
  2. Integration with external LLM APIs
  3. Robust JSON parsing with fallback
"""

import json
import logging

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

# NVIDIA API is OpenAI-compatible
client = None


def _get_client() -> OpenAI:
    """Lazy-initialize the NVIDIA API client for LLM (skill extraction)."""
    global client
    if client is None:
        if not settings.NVIDIA_LLM_API_KEY:
            raise ValueError(
                "NVIDIA_LLM_API_KEY is not set. Cannot perform skill extraction."
            )
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.NVIDIA_LLM_API_KEY,
        )
    return client


SKILL_EXTRACTION_PROMPT = """You are an expert resume parser. Extract all technical and professional skills from the following resume text.

Rules:
1. Extract ONLY skills (technologies, tools, frameworks, languages, methodologies).
2. Do NOT extract job titles, company names, or education degrees.
3. Normalize skill names (e.g., "JS" → "JavaScript", "ML" → "Machine Learning").
4. Assign a confidence score between 0.0 and 1.0 based on how clearly the skill is mentioned.
   - 1.0 = explicitly listed in a skills section
   - 0.7-0.9 = mentioned in work experience
   - 0.5-0.6 = implied from context

Return ONLY a valid JSON array of objects, no other text:
[{{"skill_name": "Python", "confidence": 0.95}}, ...]

Resume text:
---
{resume_text}
---

JSON output:"""


def extract_skills(resume_text: str) -> list[dict]:
    """
    Extract skills from resume text using LLM.

    Args:
        resume_text: Raw text extracted from a resume PDF.

    Returns:
        List of dicts: [{"skill_name": str, "confidence": float}, ...]
    """
    # Truncate very long resumes to stay within context limits
    max_chars = 8000
    text = resume_text[:max_chars] if len(resume_text) > max_chars else resume_text

    try:
        llm = _get_client()

        response = llm.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise resume parser. Always respond with valid JSON only.",
                },
                {
                    "role": "user",
                    "content": SKILL_EXTRACTION_PROMPT.format(resume_text=text),
                },
            ],
            temperature=0.1,  # Low temperature for consistent structured output
            max_tokens=1024,
        )

        raw_output = response.choices[0].message.content.strip()
        logger.info(f"LLM raw output length: {len(raw_output)} chars")

        # Parse JSON — handle markdown code blocks if LLM wraps output
        skills = _parse_skills_json(raw_output)
        logger.info(f"Extracted {len(skills)} skills via LLM")
        return skills

    except ValueError:
        # No API key — use fallback
        logger.warning("NVIDIA_LLM_API_KEY not set, using regex-based fallback")
        return _fallback_skill_extraction(text)

    except Exception as e:
        logger.error(f"LLM skill extraction failed: {e}")
        return _fallback_skill_extraction(text)


def _parse_skills_json(raw: str) -> list[dict]:
    """
    Parse LLM output into a list of skill dicts.
    Handles common LLM formatting issues (markdown code blocks, extra text).
    """
    # Strip markdown code blocks
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0]
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0]

    raw = raw.strip()

    try:
        skills = json.loads(raw)
        if isinstance(skills, list):
            return [
                {
                    "skill_name": s.get("skill_name", "").strip(),
                    "confidence": float(s.get("confidence", 0.8)),
                }
                for s in skills
                if s.get("skill_name", "").strip()
            ]
    except json.JSONDecodeError:
        logger.warning(f"Failed to parse LLM JSON output: {raw[:200]}")

    return []


def _fallback_skill_extraction(text: str) -> list[dict]:
    """
    Regex-based fallback when LLM is unavailable.
    Looks for common tech keywords in the resume text.
    Not as accurate as LLM, but provides basic functionality.
    """
    # Common tech skills to search for
    known_skills = [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust",
        "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB",
        "Django", "Flask", "FastAPI", "Spring", "React", "Angular", "Vue",
        "Node.js", "Express", "Next.js", "Svelte",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform",
        "Git", "CI/CD", "Jenkins", "GitHub Actions",
        "REST API", "GraphQL", "gRPC", "WebSocket",
        "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
        "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy",
        "HTML", "CSS", "Tailwind", "Bootstrap", "SASS",
        "Linux", "Nginx", "Apache", "Celery", "RabbitMQ", "Kafka",
        "SQL", "NoSQL", "ORM", "SQLAlchemy",
        "Agile", "Scrum", "JIRA", "Figma",
    ]

    text_lower = text.lower()
    found_skills = []

    for skill in known_skills:
        if skill.lower() in text_lower:
            found_skills.append({
                "skill_name": skill,
                "confidence": 0.7,  # Lower confidence for regex matches
            })

    logger.info(f"Fallback extracted {len(found_skills)} skills")
    return found_skills
