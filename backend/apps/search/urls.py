"""
URLs for the search app.

All search-related endpoints live under /api/search/.
"""

from django.urls import path

from .views import HybridSearchView, ResumeAskView

app_name = 'search'

urlpatterns = [
    path('', HybridSearchView.as_view(), name='hybrid-search'),
    path('ask-resume/', ResumeAskView.as_view(), name='ask-resume'),
]
