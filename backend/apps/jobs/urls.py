"""URL configuration for jobs app."""

from django.urls import path

from .views import (
    JobListView,
    JobDetailView,
    JobCreateView,
    JobUpdateView,
    RecruiterJobListView,
    ApplicationCreateView,
    CandidateApplicationListView,
    RecruiterApplicationListView,
    ApplicationStatusUpdateView,
)

app_name = 'jobs'

urlpatterns = [
    # Job endpoints
    path('', JobListView.as_view(), name='job-list'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('create/', JobCreateView.as_view(), name='job-create'),
    path('<int:pk>/update/', JobUpdateView.as_view(), name='job-update'),
    path('my-jobs/', RecruiterJobListView.as_view(), name='my-jobs'),

    # Application endpoints
    path('apply/', ApplicationCreateView.as_view(), name='apply'),
    path('my-applications/', CandidateApplicationListView.as_view(), name='my-applications'),
    path('<int:job_id>/applications/', RecruiterApplicationListView.as_view(), name='job-applications'),
    path('applications/<int:pk>/status/', ApplicationStatusUpdateView.as_view(), name='application-status'),
]
