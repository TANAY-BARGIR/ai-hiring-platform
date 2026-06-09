"""URL configuration for candidates app."""

from django.urls import path

from .views import CandidateProfileView, ResumeUploadView, ResumeListView

app_name = 'candidates'

urlpatterns = [
    path('profile/', CandidateProfileView.as_view(), name='profile'),
    path('resumes/', ResumeListView.as_view(), name='resume-list'),
    path('resumes/upload/', ResumeUploadView.as_view(), name='resume-upload'),
]
