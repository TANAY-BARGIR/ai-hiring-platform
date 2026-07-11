"""Serializers for Job and Application models."""

from rest_framework import serializers

from apps.core.serializers import CompanySerializer, SkillSerializer
from apps.recruiters.serializers import RecruiterProfileSerializer

from .models import Job, Application


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job listings (list view)."""

    company_name = serializers.CharField(source='company.name', read_only=True)
    recruiter_name = serializers.SerializerMethodField()
    required_skills = SkillSerializer(many=True, read_only=True)
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = (
            'id', 'title', 'company_name', 'recruiter_name',
            'location', 'min_experience', 'required_skills',
            'status', 'application_count', 'created_at',
        )

    def get_recruiter_name(self, obj):
        if obj.recruiter and obj.recruiter.user:
            return obj.recruiter.user.get_full_name() or obj.recruiter.user.email
        return None

    def get_application_count(self, obj):
        return obj.applications.count()


class JobDetailSerializer(serializers.ModelSerializer):
    """Full job detail with nested company and recruiter info."""

    company = CompanySerializer(read_only=True)
    recruiter = RecruiterProfileSerializer(read_only=True)
    required_skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = (
            'id', 'title', 'description', 'company', 'recruiter',
            'location', 'min_experience', 'required_skills',
            'status', 'created_at', 'updated_at',
        )


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Write serializer for creating/updating jobs.
    Skills are accepted as a list of skill names (strings).
    The view handles get_or_create for each skill.
    """

    required_skills = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        help_text='List of skill names, e.g. ["Django", "PostgreSQL"]',
    )

    class Meta:
        model = Job
        fields = (
            'title', 'description', 'location',
            'min_experience', 'required_skills', 'status',
        )

    def validate_required_skills(self, value):
        """Normalize skill names to title case for consistency."""
        return [skill.strip() for skill in value if skill.strip()]


class ApplicationSerializer(serializers.ModelSerializer):
    """Read serializer for applications with nested info."""

    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.EmailField(
        source='candidate.user.email', read_only=True,
    )
    candidate_experience = serializers.IntegerField(
        source='candidate.years_of_experience', read_only=True,
    )
    candidate_location = serializers.CharField(
        source='candidate.location', read_only=True,
    )
    candidate_id = serializers.IntegerField(source='candidate.id', read_only=True)
    candidate_skills = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)

    class Meta:
        model = Application
        fields = (
            'id', 'job', 'job_title', 'company_name',
            'candidate_id', 'candidate_name', 'candidate_email', 'candidate_experience',
            'candidate_location', 'candidate_skills', 'resume_url',
            'resume', 'status', 'applied_at',
        )
        read_only_fields = ('id', 'applied_at')

    def get_candidate_name(self, obj):
        return obj.candidate.user.get_full_name() or obj.candidate.user.email

    def get_candidate_skills(self, obj):
        return [skill.name for skill in obj.candidate.skills.all()]
        
    def get_resume_url(self, obj):
        request = self.context.get('request')
        if obj.resume and obj.resume.file and request:
            return request.build_absolute_uri(obj.resume.file.url)
        return None


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Write serializer for candidates applying to jobs."""

    class Meta:
        model = Application
        fields = ('job', 'resume')

    def validate(self, attrs):
        request = self.context['request']
        candidate_profile = request.user.candidate_profile

        # Ensure the resume belongs to this candidate
        if attrs.get('resume') and attrs['resume'].candidate != candidate_profile:
            raise serializers.ValidationError(
                {'resume': 'This resume does not belong to you.'}
            )

        # Check for duplicate application
        if Application.objects.filter(
            job=attrs['job'], candidate=candidate_profile,
        ).exists():
            raise serializers.ValidationError(
                'You have already applied to this job.'
            )

        return attrs
