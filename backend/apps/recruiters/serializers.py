"""Serializers for RecruiterProfile."""

from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.core.serializers import CompanySerializer

from .models import RecruiterProfile


class RecruiterProfileSerializer(serializers.ModelSerializer):
    """Full recruiter profile with nested user and company info."""

    user = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = ('id', 'user', 'company', 'designation')
        read_only_fields = ('id', 'user', 'company')


class RecruiterProfileUpdateSerializer(serializers.ModelSerializer):
    """Write serializer for recruiters updating their own profile."""

    class Meta:
        model = RecruiterProfile
        fields = ('designation',)
