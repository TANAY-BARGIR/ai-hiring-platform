"""
Views for job postings and applications.

Jobs:
- Anyone authenticated can list/view active jobs.
- Only recruiters can create/update/delete their own jobs.

Applications:
- Candidates can apply to jobs and view their applications.
- Recruiters can view applications for their jobs and update status.
"""

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsCandidate, IsRecruiter
from apps.core.models import Skill

from .models import Job, Application
from .serializers import (
    JobListSerializer,
    JobDetailSerializer,
    JobCreateUpdateSerializer,
    ApplicationSerializer,
    ApplicationCreateSerializer,
)


# =========================================================================
# JOB VIEWS
# =========================================================================

class JobListView(generics.ListAPIView):
    """
    List all active jobs. Available to any authenticated user.
    Supports filtering via query params: ?location=Pune&min_exp=3
    """

    serializer_class = JobListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Job.objects.filter(status=Job.Status.ACTIVE)

        # Optional filters
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)

        min_exp = self.request.query_params.get('min_exp')
        if min_exp and min_exp.isdigit():
            queryset = queryset.filter(min_experience__lte=int(min_exp))

        return queryset.select_related('company', 'recruiter__user')


class JobDetailView(generics.RetrieveAPIView):
    """Retrieve full details of a specific job."""

    serializer_class = JobDetailSerializer
    permission_classes = [IsAuthenticated]
    queryset = Job.objects.select_related(
        'company', 'recruiter__user',
    ).prefetch_related('required_skills')


class JobCreateView(generics.CreateAPIView):
    """Create a new job posting. Recruiters only."""

    serializer_class = JobCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recruiter = request.user.recruiter_profile
        skill_names = serializer.validated_data.pop('required_skills', [])

        job = serializer.save(
            company=recruiter.company,
            recruiter=recruiter,
        )

        # Create or link skills via the normalized Skill table
        for name in skill_names:
            skill, _ = Skill.objects.get_or_create(name=name)
            job.required_skills.add(skill)

        # Return using the detail serializer (not the write serializer)
        response_serializer = JobDetailSerializer(job, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class JobUpdateView(generics.UpdateAPIView):
    """Update an existing job. Only the recruiter who created it can update."""

    serializer_class = JobCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return Job.objects.filter(recruiter=self.request.user.recruiter_profile)

    def perform_update(self, serializer):
        skill_names = serializer.validated_data.pop('required_skills', None)
        job = serializer.save()

        if skill_names is not None:
            job.required_skills.clear()
            for name in skill_names:
                skill, _ = Skill.objects.get_or_create(name=name)
                job.required_skills.add(skill)


class RecruiterJobListView(generics.ListAPIView):
    """List all jobs posted by the authenticated recruiter."""

    serializer_class = JobListSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return Job.objects.filter(
            recruiter=self.request.user.recruiter_profile,
        ).select_related('company', 'recruiter__user')


# =========================================================================
# APPLICATION VIEWS
# =========================================================================

class ApplicationCreateView(generics.CreateAPIView):
    """Apply to a job. Candidates only."""

    serializer_class = ApplicationCreateSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def perform_create(self, serializer):
        candidate = self.request.user.candidate_profile

        # If no resume specified, use the primary resume
        if not serializer.validated_data.get('resume'):
            primary_resume = candidate.resumes.filter(is_primary=True).first()
            serializer.save(candidate=candidate, resume=primary_resume)
        else:
            serializer.save(candidate=candidate)


class CandidateApplicationListView(generics.ListAPIView):
    """List all applications by the authenticated candidate."""

    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return Application.objects.filter(
            candidate=self.request.user.candidate_profile,
        ).select_related('job__company', 'candidate__user')


class RecruiterApplicationListView(generics.ListAPIView):
    """List all applications for a specific job owned by the recruiter."""

    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        return Application.objects.filter(
            job_id=job_id,
            job__recruiter=self.request.user.recruiter_profile,
        ).select_related('job__company', 'candidate__user')


class ApplicationStatusUpdateView(generics.UpdateAPIView):
    """
    Update application status (SHORTLISTED/REJECTED).
    Only the recruiter who owns the job can update.
    """

    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return Application.objects.filter(
            job__recruiter=self.request.user.recruiter_profile,
        )

    def patch(self, request, *args, **kwargs):
        application = self.get_object()
        new_status = request.data.get('status')

        if new_status not in [Application.Status.SHORTLISTED, Application.Status.REJECTED]:
            return Response(
                {'status': 'Invalid status. Must be SHORTLISTED or REJECTED.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application.status = new_status
        application.save(update_fields=['status'])
        return Response(ApplicationSerializer(application).data)
