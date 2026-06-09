"""Serializers for Company and Skill models."""

from rest_framework import serializers

from .models import Company, Skill


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('id', 'name', 'website', 'description', 'created_at')
        read_only_fields = ('id', 'created_at')


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name')
        read_only_fields = ('id',)
