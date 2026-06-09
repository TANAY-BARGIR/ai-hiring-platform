"""
Custom permission classes for role-based access control.

These enforce that only users with the correct role can access
specific endpoints. Used across all app views.
"""

from rest_framework.permissions import BasePermission


class IsCandidate(BasePermission):
    """Allow access only to users with CANDIDATE role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_candidate
        )


class IsRecruiter(BasePermission):
    """Allow access only to users with RECRUITER role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_recruiter
        )


class IsAdminUser(BasePermission):
    """Allow access only to users with ADMIN role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission: only the owner can edit/delete.
    Requires the object to have a 'user' attribute.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions (GET, HEAD, OPTIONS) are allowed for any authenticated user
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        # Write permissions only for the owner
        return obj.user == request.user
