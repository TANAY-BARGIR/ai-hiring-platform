"""
Serializers for user registration, login response, and profile display.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Handles candidate and recruiter registration.

    Accepts password + password_confirm for validation.
    For recruiters, company_name and designation are required
    and handled in the view layer (not here) to keep serializers focused.
    """

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'email', 'username', 'first_name', 'last_name',
            'role', 'password', 'password_confirm',
        )

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError(
                {'password_confirm': 'Passwords do not match.'}
            )
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Read-only user representation (used in nested serializers)."""

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'role')
        read_only_fields = fields
