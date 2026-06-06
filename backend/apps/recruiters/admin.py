from django.contrib import admin

from .models import RecruiterProfile


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'designation')
    list_filter = ('company',)
    search_fields = ('user__email', 'user__first_name', 'company__name')
