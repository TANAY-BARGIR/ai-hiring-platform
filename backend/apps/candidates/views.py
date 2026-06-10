"""
Views for candidate profile and resume management.

Candidates can:
- View/update their own profile
- Upload resumes (triggers FastAPI processing)
- View resume processing status
"""

from rest_framework import generics, parsers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsCandidate

from .models import CandidateProfile, Resume
from .serializers import (
    CandidateProfileSerializer,
    CandidateProfileUpdateSerializer,
    ResumeSerializer,
)


class CandidateProfileView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve the authenticated candidate's profile.
    PATCH/PUT: Update profile fields (phone, location, years_of_experience).
    """

    permission_classes = [IsAuthenticated, IsCandidate]

    def get_object(self):
        return self.request.user.candidate_profile

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CandidateProfileUpdateSerializer
        return CandidateProfileSerializer


class ResumeUploadView(generics.CreateAPIView):
    """
    Upload a new resume PDF.

    Automatically sets is_primary=True (which deactivates previous resumes
    via the Resume.save() method). After saving, triggers the FastAPI
    AI service to process the resume in the background.
    """

    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsCandidate]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def perform_create(self, serializer):
        candidate = self.request.user.candidate_profile
        uploaded_file = self.request.FILES.get('file')

        resume = serializer.save(
            candidate=candidate,
            original_filename=uploaded_file.name if uploaded_file else 'unknown',
            is_primary=True,
        )

        # Trigger FastAPI processing (non-blocking — fails gracefully)
        from .services import trigger_resume_processing
        trigger_resume_processing(resume)


class ResumeListView(generics.ListAPIView):
    """List all resumes for the authenticated candidate."""

    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return Resume.objects.filter(
            candidate=self.request.user.candidate_profile,
        )
