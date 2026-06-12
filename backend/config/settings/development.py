"""
Development-specific Django settings.

Usage: DJANGO_SETTINGS_MODULE=config.settings.development
"""

from .base import *  # noqa: F401, F403


# =============================================================================
# DEBUG
# =============================================================================

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'backend']  # 'backend' = Docker service name


# =============================================================================
# CORS — Allow frontend dev server
# =============================================================================

CORS_ALLOW_ALL_ORIGINS = True  # Only in development!


# =============================================================================
# EMAIL — Console backend for development
# =============================================================================

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
