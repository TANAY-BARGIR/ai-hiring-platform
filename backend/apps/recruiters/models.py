from django.conf import settings
from django.db import models


class RecruiterProfile(models.Model):
    """
    Extended profile for users with RECRUITER role.

    Links to Company — multiple recruiters can belong to the same company.
    Jobs are posted through a RecruiterProfile but belong to the Company,
    so they survive if a recruiter leaves (on_delete=SET_NULL on Job.recruiter).
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recruiter_profile',
    )
    company = models.ForeignKey(
        'core.Company',
        on_delete=models.CASCADE,
        related_name='recruiters',
    )
    designation = models.CharField(max_length=100)

    class Meta:
        db_table = 'recruiter_profiles'
        verbose_name = 'Recruiter Profile'
        verbose_name_plural = 'Recruiter Profiles'

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} at {self.company.name}"
