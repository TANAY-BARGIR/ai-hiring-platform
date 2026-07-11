"""Serializers for CandidateProfile and Resume."""

from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.core.serializers import SkillSerializer

from .models import CandidateProfile, Resume


class ResumeSerializer(serializers.ModelSerializer):
    """
    Resume serializer.
    File upload is write-only (we return the URL, not the file object).
    processing_status is read-only (only FastAPI callback can change it).
    """

    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = (
            'id', 'file', 'file_url', 'original_filename', 'is_primary',
            'processing_status', 'failure_reason', 'uploaded_at',
        )
        read_only_fields = ('id', 'original_filename', 'is_primary', 'processing_status', 'failure_reason', 'uploaded_at')
        extra_kwargs = {
            'file': {'write_only': True},
        }

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class CandidateProfileSerializer(serializers.ModelSerializer):
    """
    Full candidate profile with nested user info, skills, and resumes.
    Skills are displayed as names for readability.
    """

    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    resumes = ResumeSerializer(many=True, read_only=True)

    class Meta:
        model = CandidateProfile
        fields = (
            'id', 'user', 'phone', 'location',
            'years_of_experience', 'skills', 'resumes', 'updated_at',
        )
        read_only_fields = ('id', 'user', 'skills', 'updated_at')


class CandidateProfileUpdateSerializer(serializers.ModelSerializer):
    """Write serializer for candidates updating their own profile."""

    class Meta:
        model = CandidateProfile
        fields = ('phone', 'location', 'years_of_experience')
