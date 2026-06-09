"""Views for recruiter profile management."""

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsRecruiter

from .models import RecruiterProfile
from .serializers import RecruiterProfileSerializer, RecruiterProfileUpdateSerializer


class RecruiterProfileView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve the authenticated recruiter's profile.
    PATCH/PUT: Update profile fields (designation).
    """

    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_object(self):
        return self.request.user.recruiter_profile

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return RecruiterProfileUpdateSerializer
        return RecruiterProfileSerializer
