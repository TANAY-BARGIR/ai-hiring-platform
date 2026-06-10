"""
Internal API URLs — called by FastAPI, not by frontend users.

These endpoints are protected by X-Internal-Token header,
not by JWT authentication.
"""

from django.urls import path

from apps.candidates.internal_views import resume_processing_callback

app_name = 'internal'

urlpatterns = [
    path(
        'resumes/<int:resume_id>/callback/',
        resume_processing_callback,
        name='resume-callback',
    ),
]
