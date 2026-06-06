from django.db import models


class Job(models.Model):
    """
    Job posting created by a recruiter, belonging to a company.

    Links to both Company (owner) and RecruiterProfile (creator).
    Company link uses CASCADE — if company is deleted, its jobs go too.
    Recruiter link uses SET_NULL — jobs survive recruiter departure.

    required_skills uses M2M with the normalized Skill table for
    consistent SQL queries against candidate skills.
    """

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'
        CLOSED = 'CLOSED', 'Closed'

    company = models.ForeignKey(
        'core.Company',
        on_delete=models.CASCADE,
        related_name='jobs',
    )
    recruiter = models.ForeignKey(
        'recruiters.RecruiterProfile',
        on_delete=models.SET_NULL,
        null=True,
        related_name='posted_jobs',
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    min_experience = models.PositiveIntegerField(
        default=0,
        help_text='Minimum years of experience required.',
    )
    location = models.CharField(max_length=100, blank=True)
    required_skills = models.ManyToManyField(
        'core.Skill',
        related_name='required_by_jobs',
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'jobs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company.name}"


class Application(models.Model):
    """
    A candidate's application to a specific job.

    unique_together ensures one application per candidate per job.
    Resume is nullable (SET_NULL) so application history survives
    even if the candidate deletes the resume file later.
    """

    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        REJECTED = 'REJECTED', 'Rejected'

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications',
    )
    candidate = models.ForeignKey(
        'candidates.CandidateProfile',
        on_delete=models.CASCADE,
        related_name='applications',
    )
    resume = models.ForeignKey(
        'candidates.Resume',
        on_delete=models.SET_NULL,
        null=True,
        related_name='applications',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPLIED,
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'applications'
        unique_together = ('job', 'candidate')
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.candidate} → {self.job.title}"
