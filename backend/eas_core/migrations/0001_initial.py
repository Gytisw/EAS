# Generated by Django 5.2 on 2025-05-06 18:46

import django.db.models.deletion
import encrypted_fields.fields
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Credentials',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('provider_name', models.CharField(help_text="e.g., 'sendgrid', 'gmail_oauth', 'openai'", max_length=100)),
                ('api_key', encrypted_fields.fields.EncryptedCharField(blank=True, max_length=255, null=True)),
                ('api_secret', encrypted_fields.fields.EncryptedTextField(blank=True, help_text="For API secrets or OAuth refresh tokens if not handled by allauth's SocialToken", null=True)),
                ('other_config', encrypted_fields.fields.EncryptedJSONField(blank=True, help_text='Other provider-specific encrypted settings', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'provider_name')},
            },
        ),
        migrations.CreateModel(
            name='TaskConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text="e.g., 'Weekly Marketing Email Draft'", max_length=255)),
                ('task_type', models.CharField(help_text="e.g., 'email_generation', 'content_summarization'", max_length=100)),
                ('ai_provider', models.CharField(help_text="e.g., 'openai', 'gemini', 'anthropic'", max_length=50)),
                ('ai_model_name', models.CharField(blank=True, help_text="e.g., 'gpt-4-turbo'", max_length=100, null=True)),
                ('prompt_template', models.TextField(help_text='Core instructions/template for the AI')),
                ('output_constraints', models.JSONField(blank=True, help_text='e.g., tone, style, keywords, length', null=True)),
                ('refinement_iterations', models.PositiveSmallIntegerField(default=1, help_text='Refinement loops for LangGraph agent')),
                ('target_email_recipients', models.TextField(blank=True, help_text='e.g., comma-separated emails', null=True)),
                ('email_subject_template', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('linked_credentials', models.ForeignKey(blank=True, help_text='Email provider credentials for sending', null=True, on_delete=django.db.models.deletion.SET_NULL, to='eas_core.credentials')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Schedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('frequency', models.CharField(help_text="e.g., 'once', 'daily', 'weekly'", max_length=50)),
                ('cron_expression', models.CharField(blank=True, help_text='For complex schedules', max_length=100, null=True)),
                ('next_run_at', models.DateTimeField(db_index=True, help_text='Calculated time for the next execution')),
                ('last_run_at', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(help_text='Owner of the schedule', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('task_config', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='eas_core.taskconfig')),
            ],
        ),
    ]
