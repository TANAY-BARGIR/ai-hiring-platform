from django.db import models


class Company(models.Model):
    """
    Standalone company entity.

    Extracted from RecruiterProfile to allow:
    - Multiple recruiters per company
    - Jobs that outlive individual recruiters
    - Clean company branding on job listings
    """

    name = models.CharField(max_length=255, unique=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def __str__(self):
        return self.name


class Skill(models.Model):
    """
    Normalized skill table — each skill stored exactly once.

    Used via M2M by both CandidateProfile and Job to enable:
    - Clean SQL filtering: Skill.objects.filter(name='Django')
    - Analytics: "Top 10 most demanded skills"
    - Deduplication: AI callback uses get_or_create(name=extracted_name)
    """

    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'skills'
        ordering = ['name']

    def __str__(self):
        return self.name
