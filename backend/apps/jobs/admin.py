from django.contrib import admin

from .models import Job, Application


class ApplicationInline(admin.TabularInline):
    model = Application
    extra = 0
    readonly_fields = ('applied_at',)


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'recruiter', 'status', 'min_experience', 'created_at')
    list_filter = ('status', 'company')
    search_fields = ('title', 'company__name', 'description')
    filter_horizontal = ('required_skills',)
    inlines = [ApplicationInline]


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'job', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('candidate__user__email', 'job__title')
    readonly_fields = ('applied_at',)
