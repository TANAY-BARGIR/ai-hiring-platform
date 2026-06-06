from django.contrib import admin

from .models import CandidateProfile, Resume


class ResumeInline(admin.TabularInline):
    model = Resume
    extra = 0
    readonly_fields = ('processing_status', 'uploaded_at')


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'years_of_experience', 'updated_at')
    list_filter = ('years_of_experience',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'location')
    inlines = [ResumeInline]
    filter_horizontal = ('skills',)


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'original_filename', 'is_primary', 'processing_status', 'uploaded_at')
    list_filter = ('processing_status', 'is_primary')
    search_fields = ('candidate__user__email', 'original_filename')
    readonly_fields = ('uploaded_at',)
