"""
Auth views: Registration + JWT token endpoints.

Login/refresh/verify are handled by SimpleJWT's built-in views
(configured in urls.py). Only registration needs a custom view.
"""

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.candidates.models import CandidateProfile
from apps.core.models import Company
from apps.recruiters.models import RecruiterProfile

from .serializers import UserRegistrationSerializer


class RegisterView(generics.CreateAPIView):
    """
    Register a new user (candidate or recruiter).

    For candidates: Creates User + CandidateProfile automatically.
    For recruiters: Also requires company_name and designation in the request body.
                    Creates or links to existing Company + creates RecruiterProfile.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Create the corresponding profile based on role
        if user.is_candidate:
            CandidateProfile.objects.create(user=user)

        elif user.is_recruiter:
            company_name = request.data.get('company_name')
            designation = request.data.get('designation', '')

            if not company_name:
                user.delete()
                return Response(
                    {'company_name': 'This field is required for recruiters.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            company, _ = Company.objects.get_or_create(name=company_name)
            RecruiterProfile.objects.create(
                user=user,
                company=company,
                designation=designation,
            )

        return Response(
            {
                'message': f'{user.role.capitalize()} registered successfully.',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )
