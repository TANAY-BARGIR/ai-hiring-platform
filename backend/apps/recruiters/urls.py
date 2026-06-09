"""URL configuration for recruiters app."""

from django.urls import path

from .views import RecruiterProfileView

app_name = 'recruiters'

urlpatterns = [
    path('profile/', RecruiterProfileView.as_view(), name='profile'),
]
