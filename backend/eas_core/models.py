from django.db import models
from django.conf import settings
from encrypted_fields import fields as encrypted_fields_pkg

# Create your models here.

class Credentials(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    provider_name = models.CharField(max_length=100, help_text="e.g., 'sendgrid', 'gmail_oauth', 'openai'")
    api_key = encrypted_fields_pkg.EncryptedCharField(max_length=255, blank=True, null=True)
    api_secret = encrypted_fields_pkg.EncryptedTextField(blank=True, null=True, help_text="For API secrets or OAuth refresh tokens if not handled by allauth's SocialToken")
    other_config = encrypted_fields_pkg.EncryptedJSONField(blank=True, null=True, help_text="Other provider-specific encrypted settings")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'provider_name')

    def __str__(self):
        return f"{self.user}'s {self.provider_name} Credentials"

class TaskConfig(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, help_text="e.g., 'Weekly Marketing Email Draft'")
    task_type = models.CharField(max_length=100, help_text="e.g., 'email_generation', 'content_summarization'")
    ai_provider = models.CharField(max_length=50, help_text="e.g., 'openai', 'gemini', 'anthropic'")
    ai_model_name = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., 'gpt-4-turbo'")
    prompt_template = models.TextField(help_text="Core instructions/template for the AI")
    output_constraints = models.JSONField(blank=True, null=True, help_text="e.g., tone, style, keywords, length")
    refinement_iterations = models.PositiveSmallIntegerField(default=1, help_text="Refinement loops for LangGraph agent")
    target_email_recipients = models.TextField(blank=True, null=True, help_text="e.g., comma-separated emails")
    email_subject_template = models.CharField(max_length=255, blank=True, null=True)
    linked_credentials = models.ForeignKey('Credentials', on_delete=models.SET_NULL, null=True, blank=True, help_text="Email provider credentials for sending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.task_type}) by {self.user}"

class Schedule(models.Model):
    task_config = models.ForeignKey('TaskConfig', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, help_text="Owner of the schedule")
    FREQUENCY_ONCE = 'once'
    FREQUENCY_DAILY = 'daily'
    FREQUENCY_WEEKLY = 'weekly'
    FREQUENCY_MONTHLY = 'monthly'
    FREQUENCY_CRON = 'cron'

    FREQUENCY_CHOICES = [
        (FREQUENCY_ONCE, 'Once'),
        (FREQUENCY_DAILY, 'Daily'),
        (FREQUENCY_WEEKLY, 'Weekly'),
        (FREQUENCY_MONTHLY, 'Monthly'),
        (FREQUENCY_CRON, 'Cron'),
    ]
    frequency = models.CharField(
        max_length=50,
        choices=FREQUENCY_CHOICES,
        help_text="Schedule frequency"
    )
    cron_expression = models.CharField(max_length=100, blank=True, null=True, help_text="Cron expression, required if frequency is 'cron'")
    next_run_at = models.DateTimeField(db_index=True, help_text="Time for the next execution. Required if frequency is 'once'.")
    last_run_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Schedule for {self.task_config.name} - Next run: {self.next_run_at}"
