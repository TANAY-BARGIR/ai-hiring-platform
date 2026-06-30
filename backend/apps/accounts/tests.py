"""
Tests for the accounts app — User model, registration, and JWT auth.
"""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User


class UserModelTests(TestCase):
    """Tests for the custom User model."""

    def test_create_candidate_user(self):
        user = User.objects.create_user(
            username='testcandidate', email='cand@test.com',
            password='testpass123', role=User.Role.CANDIDATE,
        )
        self.assertEqual(user.role, 'CANDIDATE')
        self.assertTrue(user.is_candidate)
        self.assertFalse(user.is_recruiter)
        self.assertEqual(str(user), 'cand@test.com')

    def test_create_recruiter_user(self):
        user = User.objects.create_user(
            username='testrecruiter', email='rec@test.com',
            password='testpass123', role=User.Role.RECRUITER,
        )
        self.assertTrue(user.is_recruiter)
        self.assertFalse(user.is_candidate)

    def test_email_is_unique(self):
        User.objects.create_user(
            username='user1', email='dup@test.com',
            password='pass123', role=User.Role.CANDIDATE,
        )
        with self.assertRaises(Exception):
            User.objects.create_user(
                username='user2', email='dup@test.com',
                password='pass123', role=User.Role.RECRUITER,
            )

    def test_email_is_login_field(self):
        self.assertEqual(User.USERNAME_FIELD, 'email')


class RegistrationAPITests(TestCase):
    """Tests for the /api/accounts/register/ endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/register/'

    def test_register_candidate_success(self):
        data = {
            'email': 'new_cand@test.com', 'username': 'newcand',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'CANDIDATE', 'first_name': 'Test', 'last_name': 'Candidate',
        }
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='new_cand@test.com').exists())
        # Should auto-create CandidateProfile
        user = User.objects.get(email='new_cand@test.com')
        self.assertTrue(hasattr(user, 'candidate_profile'))

    def test_register_recruiter_requires_company(self):
        data = {
            'email': 'rec@test.com', 'username': 'newrec',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'RECRUITER', 'first_name': 'Test', 'last_name': 'Recruiter',
        }
        res = self.client.post(self.url, data, format='json')
        # Should fail — no company_name
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_recruiter_with_company(self):
        data = {
            'email': 'rec2@test.com', 'username': 'newrec2',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'RECRUITER', 'first_name': 'Test', 'last_name': 'Recruiter',
            'company_name': 'Acme Corp',
        }
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='rec2@test.com')
        self.assertTrue(hasattr(user, 'recruiter_profile'))
        self.assertEqual(user.recruiter_profile.company.name, 'Acme Corp')

    def test_register_duplicate_email_fails(self):
        data = {
            'email': 'dup@test.com', 'username': 'user1',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'CANDIDATE', 'first_name': 'A', 'last_name': 'B',
        }
        self.client.post(self.url, data, format='json')
        data['username'] = 'user2'
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class JWTAuthTests(TestCase):
    """Tests for JWT login flow."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='jwtuser', email='jwt@test.com',
            password='testpass123', role=User.Role.CANDIDATE,
        )

    def test_login_returns_tokens(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'jwt@test.com', 'password': 'testpass123',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_login_wrong_password_fails(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'jwt@test.com', 'password': 'wrongpass',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_without_token_fails(self):
        res = self.client.get('/api/jobs/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_with_token_succeeds(self):
        login = self.client.post('/api/auth/login/', {
            'email': 'jwt@test.com', 'password': 'testpass123',
        }, format='json')
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get('/api/jobs/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
