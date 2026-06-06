from django.conf import settings
from django.db import models


class CandidateProfile(models.Model):
    """
    Extended profile for users with CANDIDATE role.

    Created after registration. Holds structured data used for
    SQL-based filtering in hybrid search (years_of_experience, location).
    Skills are aggregated here (not on Resume) for efficient querying.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='candidate_profile',
    )
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    years_of_experience = models.PositiveIntegerField(
        default=0,
        help_text='Manually entered by candidate. Used for SQL filtering.',
    )

    # Aggregated skills from AI extraction — M2M for clean SQL queries
    skills = models.ManyToManyField(
        'core.Skill',
        related_name='candidates',
        blank=True,
        help_text='Skills extracted by AI from primary resume.',
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'candidate_profiles'
        verbose_name = 'Candidate Profile'
        verbose_name_plural = 'Candidate Profiles'

    def __str__(self):
        return self.user.get_full_name() or self.user.email


class Resume(models.Model):
    """
    Uploaded resume file with processing state tracking.

    State machine: PENDING → PROCESSING → READY / FAILED
    - Django sets PENDING on upload and triggers FastAPI.
    - FastAPI sets PROCESSING, then callbacks with READY or FAILED.

    The is_primary flag ensures FAISS and RAG always use the correct resume.
    Custom save() enforces exactly one primary resume per candidate.
    """

    class ProcessingStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        READY = 'READY', 'Ready'
        FAILED = 'FAILED', 'Failed'

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='resumes',
    )
    file = models.FileField(upload_to='resumes/%Y/%m/')
    original_filename = models.CharField(max_length=255)
    is_primary = models.BooleanField(
        default=True,
        help_text='Only primary resume is used for search and RAG.',
    )
    processing_status = models.CharField(
        max_length=20,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.PENDING,
    )
    failure_reason = models.TextField(
        blank=True,
        help_text='Error message from FastAPI if processing failed.',
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'resumes'
        ordering = ['-uploaded_at']

    def save(self, *args, **kwargs):
        """Enforce single primary resume per candidate."""
        if self.is_primary:
            Resume.objects.filter(
                candidate=self.candidate,
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        status = 'Primary' if self.is_primary else 'Old'
        return f"Resume: {self.candidate} ({status})"
