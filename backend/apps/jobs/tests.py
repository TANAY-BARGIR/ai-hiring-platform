"""
Tests for the jobs app — Job CRUD, applications, and permissions.
"""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User
from apps.candidates.models import CandidateProfile
from apps.core.models import Company
from apps.recruiters.models import RecruiterProfile
from apps.jobs.models import Job, Application


class JobModelTests(TestCase):
    """Tests for the Job model."""

    def setUp(self):
        self.company = Company.objects.create(name='TestCorp')
        self.user = User.objects.create_user(
            username='rec', email='rec@test.com',
            password='pass123', role=User.Role.RECRUITER,
        )
        self.recruiter = RecruiterProfile.objects.create(
            user=self.user, company=self.company, designation='Engineer',
        )

    def test_job_default_status_is_draft(self):
        job = Job.objects.create(
            company=self.company, recruiter=self.recruiter,
            title='Dev', description='Desc',
        )
        self.assertEqual(job.status, Job.Status.DRAFT)

    def test_job_str_contains_title_and_company(self):
        job = Job.objects.create(
            company=self.company, recruiter=self.recruiter,
            title='Backend Dev', description='Desc',
        )
        self.assertIn('Backend Dev', str(job))
        self.assertIn('TestCorp', str(job))


class ApplicationModelTests(TestCase):
    """Tests for the Application model."""

    def setUp(self):
        self.company = Company.objects.create(name='AppCorp')
        rec_user = User.objects.create_user(
            username='apprec', email='apprec@test.com',
            password='pass123', role=User.Role.RECRUITER,
        )
        self.recruiter = RecruiterProfile.objects.create(
            user=rec_user, company=self.company, designation='HR',
        )
        self.job = Job.objects.create(
            company=self.company, recruiter=self.recruiter,
            title='Dev', description='Desc', status=Job.Status.ACTIVE,
        )
        cand_user = User.objects.create_user(
            username='appcand', email='appcand@test.com',
            password='pass123', role=User.Role.CANDIDATE,
        )
        self.candidate = CandidateProfile.objects.create(user=cand_user)

    def test_application_default_status(self):
        app = Application.objects.create(job=self.job, candidate=self.candidate)
        self.assertEqual(app.status, Application.Status.APPLIED)

    def test_unique_application_per_job(self):
        Application.objects.create(job=self.job, candidate=self.candidate)
        with self.assertRaises(Exception):
            Application.objects.create(job=self.job, candidate=self.candidate)


class JobAPITests(TestCase):
    """Tests for job API endpoints."""

    def setUp(self):
        self.rec_client = APIClient()
        self.cand_client = APIClient()

        # Register recruiter
        self.rec_client.post('/api/auth/register/', {
            'email': 'jobrec@test.com', 'username': 'jobrec',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'RECRUITER', 'first_name': 'Job', 'last_name': 'Rec',
            'company_name': 'HireCo',
        }, format='json')
        login = self.rec_client.post('/api/auth/login/', {
            'email': 'jobrec@test.com', 'password': 'StrongPass123!',
        }, format='json')
        self.rec_client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')

        # Register candidate
        self.cand_client.post('/api/auth/register/', {
            'email': 'jobcand@test.com', 'username': 'jobcand',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'CANDIDATE', 'first_name': 'Job', 'last_name': 'Cand',
        }, format='json')
        login2 = self.cand_client.post('/api/auth/login/', {
            'email': 'jobcand@test.com', 'password': 'StrongPass123!',
        }, format='json')
        self.cand_client.credentials(HTTP_AUTHORIZATION=f'Bearer {login2.data["access"]}')

    def _get_results(self, res):
        """Extract list from response, handling both paginated and flat."""
        if isinstance(res.data, dict) and 'results' in res.data:
            return res.data['results']
        if isinstance(res.data, list):
            return res.data
        return []

    def test_recruiter_can_create_job(self):
        res = self.rec_client.post('/api/jobs/create/', {
            'title': 'Senior Django Dev',
            'description': 'Build awesome stuff',
            'location': 'Remote',
            'min_experience': 3,
            'required_skills': ['Django', 'PostgreSQL'],
            'status': 'ACTIVE',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['title'], 'Senior Django Dev')

    def test_candidate_cannot_create_job(self):
        res = self.cand_client.post('/api/jobs/create/', {
            'title': 'Fake Job', 'description': 'No',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_recruiter_can_list_own_jobs(self):
        self.rec_client.post('/api/jobs/create/', {
            'title': 'Job1', 'description': 'Desc', 'status': 'ACTIVE',
        }, format='json')
        res = self.rec_client.get('/api/jobs/my-jobs/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = self._get_results(res)
        self.assertGreaterEqual(len(results), 1)

    def test_active_jobs_visible_to_candidates(self):
        self.rec_client.post('/api/jobs/create/', {
            'title': 'Visible Job', 'description': 'Desc', 'status': 'ACTIVE',
        }, format='json')
        res = self.cand_client.get('/api/jobs/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = self._get_results(res)
        self.assertGreaterEqual(len(results), 1)

    def test_draft_jobs_not_visible_to_candidates(self):
        self.rec_client.post('/api/jobs/create/', {
            'title': 'Draft Job', 'description': 'Desc', 'status': 'DRAFT',
        }, format='json')
        res = self.cand_client.get('/api/jobs/')
        results = self._get_results(res)
        titles = [j['title'] for j in results]
        self.assertNotIn('Draft Job', titles)


class ApplicationAPITests(TestCase):
    """Tests for application workflow."""

    def setUp(self):
        self.rec_client = APIClient()
        self.cand_client = APIClient()

        # Recruiter
        self.rec_client.post('/api/auth/register/', {
            'email': 'apprec2@test.com', 'username': 'apprec2',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'RECRUITER', 'first_name': 'App', 'last_name': 'Rec',
            'company_name': 'AppCo',
        }, format='json')
        login = self.rec_client.post('/api/auth/login/', {
            'email': 'apprec2@test.com', 'password': 'StrongPass123!',
        }, format='json')
        self.rec_client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')

        # Create a job
        job_res = self.rec_client.post('/api/jobs/create/', {
            'title': 'Apply Test Job', 'description': 'Desc', 'status': 'ACTIVE',
        }, format='json')
        self.job_id = job_res.data['id']

        # Candidate
        self.cand_client.post('/api/auth/register/', {
            'email': 'appcand2@test.com', 'username': 'appcand2',
            'password': 'StrongPass123!', 'password_confirm': 'StrongPass123!',
            'role': 'CANDIDATE', 'first_name': 'App', 'last_name': 'Cand',
        }, format='json')
        login2 = self.cand_client.post('/api/auth/login/', {
            'email': 'appcand2@test.com', 'password': 'StrongPass123!',
        }, format='json')
        self.cand_client.credentials(HTTP_AUTHORIZATION=f'Bearer {login2.data["access"]}')

    def _get_results(self, res):
        if isinstance(res.data, dict) and 'results' in res.data:
            return res.data['results']
        if isinstance(res.data, list):
            return res.data
        return []

    def test_candidate_can_apply(self):
        res = self.cand_client.post('/api/jobs/apply/', {
            'job': self.job_id,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_duplicate_application_rejected(self):
        self.cand_client.post('/api/jobs/apply/', {'job': self.job_id}, format='json')
        res = self.cand_client.post('/api/jobs/apply/', {'job': self.job_id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_recruiter_can_view_applications(self):
        self.cand_client.post('/api/jobs/apply/', {'job': self.job_id}, format='json')
        res = self.rec_client.get(f'/api/jobs/{self.job_id}/applications/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = self._get_results(res)
        self.assertGreaterEqual(len(results), 1)

    def test_recruiter_can_shortlist(self):
        self.cand_client.post('/api/jobs/apply/', {'job': self.job_id}, format='json')
        res = self.rec_client.get(f'/api/jobs/{self.job_id}/applications/')
        results = self._get_results(res)
        self.assertGreater(len(results), 0, 'No applications found')
        app_id = results[0]['id']
        res = self.rec_client.patch(f'/api/jobs/applications/{app_id}/status/', {
            'status': 'SHORTLISTED',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'SHORTLISTED')
