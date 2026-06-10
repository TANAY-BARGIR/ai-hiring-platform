"""
Root URL configuration for AI Hiring Platform.

All API endpoints are namespaced under /api/ for clean separation.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API endpoints (public — JWT auth)
    path('api/auth/', include('apps.accounts.urls')),
    path('api/candidates/', include('apps.candidates.urls')),
    path('api/recruiters/', include('apps.recruiters.urls')),
    path('api/jobs/', include('apps.jobs.urls')),

    # Internal API (service-to-service — token auth)
    path('api/internal/', include('apps.candidates.internal_urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
