"""
Internal API views — called by FastAPI, not by frontend users.

Protected by X-Internal-Token header (shared secret).
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from django.conf import settings

from apps.candidates.models import Resume
from apps.core.models import Skill


def verify_internal_token(request):
    """Verify the internal service token from the request header."""
    token = request.headers.get('X-Internal-Token', '')
    return token == settings.INTERNAL_API_TOKEN


@api_view(['PATCH'])
@permission_classes([AllowAny])  # Auth handled by internal token
def resume_processing_callback(request, resume_id):
    """
    Callback endpoint for FastAPI to report resume processing results.

    Receives extracted skills and status update.
    Updates Resume.processing_status and creates Skill M2M entries
    on the CandidateProfile.
    """
    if not verify_internal_token(request):
        return Response(
            {'detail': 'Invalid internal token'},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        resume = Resume.objects.select_related('candidate').get(pk=resume_id)
    except Resume.DoesNotExist:
        return Response(
            {'detail': 'Resume not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    processing_status = request.data.get('processing_status')
    if processing_status not in ['READY', 'FAILED']:
        return Response(
            {'detail': 'Invalid processing_status. Must be READY or FAILED.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Update resume status
    resume.processing_status = processing_status
    resume.failure_reason = request.data.get('failure_reason', '')
    resume.save(update_fields=['processing_status', 'failure_reason'])

    # If successful, update candidate skills
    if processing_status == 'READY':
        extracted_skills = request.data.get('extracted_skills', [])
        candidate = resume.candidate

        for skill_data in extracted_skills:
            skill_name = skill_data.get('skill_name', '').strip()
            if skill_name:
                skill, _ = Skill.objects.get_or_create(name=skill_name)
                candidate.skills.add(skill)

    return Response({
        'detail': f'Resume {resume_id} updated to {processing_status}',
        'resume_id': resume_id,
        'processing_status': processing_status,
    })
