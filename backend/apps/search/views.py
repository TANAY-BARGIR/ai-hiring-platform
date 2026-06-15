"""
Hybrid Search and Resume Chat API views.

These endpoints are user-facing (JWT authenticated). They combine:
  - FastAPI's AI capabilities (semantic search, RAG)
  - Django's ORM capabilities (SQL filtering, permissions)

This is the "hybrid search" pattern — the key architectural feature
of this project.
"""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.candidates.models import CandidateProfile
from apps.candidates.serializers import CandidateProfileSerializer

from .services import semantic_search, ask_resume


class HybridSearchView(APIView):
    """
    Hybrid search: FAISS semantic search + Django SQL filters.

    POST /api/search/
    Body: {
        "query": "Python developer with cloud experience",
        "min_experience": 2,
        "location": "Bangalore",
        "top_k": 10
    }

    Flow:
      1. Send query to FastAPI → FAISS returns candidate_ids + scores
      2. Django filters by min_experience, location, etc. via ORM
      3. Return ranked, filtered candidate profiles
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get("query", "").strip()
        if not query or len(query) < 3:
            return Response(
                {"detail": "Query must be at least 3 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Optional SQL filters
        min_experience = request.data.get("min_experience")
        location = request.data.get("location", "").strip()
        skills_filter = request.data.get("skills", [])
        top_k = request.data.get("top_k", 20)

        # Step 1: Semantic search via FastAPI → FAISS
        ai_results = semantic_search(query=query, top_k=top_k)

        if not ai_results:
            return Response({
                "query": query,
                "results": [],
                "total": 0,
                "message": "No semantic matches found.",
            })

        # Extract unique candidate IDs (preserving score order)
        seen = set()
        candidate_scores = {}
        for r in ai_results:
            cid = r["candidate_id"]
            if cid not in seen:
                seen.add(cid)
                candidate_scores[cid] = r["score"]

        # Step 2: SQL filtering via Django ORM
        queryset = CandidateProfile.objects.filter(
            id__in=list(candidate_scores.keys())
        ).select_related("user")

        if min_experience is not None:
            queryset = queryset.filter(
                years_of_experience__gte=int(min_experience)
            )
        if location:
            queryset = queryset.filter(location__icontains=location)
        if skills_filter:
            queryset = queryset.filter(
                skills__name__in=skills_filter
            ).distinct()

        # Step 3: Serialize and inject FAISS scores
        serializer = CandidateProfileSerializer(queryset, many=True)
        results = serializer.data

        # Add similarity score from FAISS to each result
        for result in results:
            result["similarity_score"] = candidate_scores.get(
                result["id"], 0.0
            )

        # Sort by FAISS score (semantic relevance)
        results.sort(key=lambda x: x["similarity_score"], reverse=True)

        return Response({
            "query": query,
            "results": results,
            "total": len(results),
            "filters_applied": {
                "min_experience": min_experience,
                "location": location or None,
                "skills": skills_filter or None,
            },
        })


class ResumeAskView(APIView):
    """
    RAG-based resume Q&A.

    POST /api/search/ask-resume/
    Body: {
        "resume_id": 12,
        "question": "Does this candidate have microservices experience?"
    }

    Flow:
      1. Send question + resume_id to FastAPI → RAG pipeline
      2. FastAPI retrieves relevant chunks from FAISS
      3. LLM generates contextually grounded answer
      4. Return answer + source excerpts
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        resume_id = request.data.get("resume_id")
        question = request.data.get("question", "").strip()

        if not resume_id:
            return Response(
                {"detail": "resume_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not question or len(question) < 5:
            return Response(
                {"detail": "Question must be at least 5 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Call FastAPI RAG endpoint
        result = ask_resume(resume_id=int(resume_id), question=question)

        return Response({
            "resume_id": resume_id,
            "question": question,
            "answer": result.get("answer", ""),
            "source_chunks": result.get("source_chunks", []),
            "num_chunks_used": result.get("num_chunks_used", 0),
        })
