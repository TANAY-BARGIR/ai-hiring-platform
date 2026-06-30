"""
Tests for the candidates app — Resume model and profile API.
"""

from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
import tempfile

from apps.accounts.models import User
from apps.candidates.models import CandidateProfile, Resume


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ResumeModelTests(TestCase):
    """Tests for Resume model business logic."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='cand1', email='cand1@test.com',
            password='pass123', role=User.Role.CANDIDATE,
        )
        self.profile = CandidateProfile.objects.create(user=self.user)

    def test_first_resume_is_primary(self):
        resume = Resume.objects.create(
            candidate=self.profile,
            file=SimpleUploadedFile('r1.pdf', b'%PDF-test'),
            original_filename='r1.pdf',
            is_primary=True,
        )
        self.assertTrue(resume.is_primary)

    def test_new_primary_demotes_old_primary(self):
        """Key business rule: only one primary resume per candidate."""
        r1 = Resume.objects.create(
            candidate=self.profile,
            file=SimpleUploadedFile('r1.pdf', b'%PDF-test1'),
            original_filename='r1.pdf', is_primary=True,
        )
        r2 = Resume.objects.create(
            candidate=self.profile,
            file=SimpleUploadedFile('r2.pdf', b'%PDF-test2'),
            original_filename='r2.pdf', is_primary=True,
        )
        r1.refresh_from_db()
        self.assertFalse(r1.is_primary)
        self.assertTrue(r2.is_primary)

    def test_processing_status_default_is_pending(self):
        resume = Resume.objects.create(
            candidate=self.profile,
            file=SimpleUploadedFile('r.pdf', b'%PDF'),
            original_filename='r.pdf',
        )
        self.assertEqual(resume.processing_status, Resume.ProcessingStatus.PENDING)

    def test_resume_str_representation(self):
        resume = Resume.objects.create(
            candidate=self.profile,
            file=SimpleUploadedFile('r.pdf', b'%PDF'),
            original_filename='r.pdf', is_primary=True,
        )
        self.assertIn('Primary', str(resume))


class CandidateProfileTests(TestCase):
    """Tests for CandidateProfile model."""

    def test_profile_created_on_registration(self):
        client = APIClient()
        client.post('/api/auth/register/', {
            'email': 'profile_test@test.com', 'username': 'proftest',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'CANDIDATE', 'first_name': 'Jane', 'last_name': 'Doe',
        }, format='json')
        user = User.objects.get(email='profile_test@test.com')
        self.assertTrue(CandidateProfile.objects.filter(user=user).exists())

    def test_default_experience_is_zero(self):
        user = User.objects.create_user(
            username='exp0', email='exp0@test.com',
            password='pass123', role=User.Role.CANDIDATE,
        )
        profile = CandidateProfile.objects.create(user=user)
        self.assertEqual(profile.years_of_experience, 0)


class CandidateAPITests(TestCase):
    """Tests for candidate API endpoints."""

    def setUp(self):
        self.client = APIClient()
        # Register and login a candidate
        self.client.post('/api/auth/register/', {
            'email': 'api_cand@test.com', 'username': 'apicand',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'CANDIDATE', 'first_name': 'Api', 'last_name': 'Cand',
        }, format='json')
        login = self.client.post('/api/auth/login/', {
            'email': 'api_cand@test.com', 'password': 'StrongPass123!',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')

    def test_get_candidate_profile(self):
        res = self.client.get('/api/candidates/profile/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['user']['email'], 'api_cand@test.com')

    def test_recruiter_cannot_access_candidate_profile(self):
        """Permission test: recruiter role cannot hit candidate endpoints."""
        client2 = APIClient()
        client2.post('/api/auth/register/', {
            'email': 'rec_perm@test.com', 'username': 'recperm',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'RECRUITER', 'first_name': 'Rec', 'last_name': 'Perm',
            'company_name': 'TestCo',
        }, format='json')
        login = client2.post('/api/auth/login/', {
            'email': 'rec_perm@test.com', 'password': 'StrongPass123!',
        }, format='json')
        client2.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        res = client2.get('/api/candidates/profile/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
