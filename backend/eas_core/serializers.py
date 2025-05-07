from rest_framework import serializers
from .models import TaskConfig, Credentials, Schedule

class TaskConfigSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    linked_credentials_id = serializers.PrimaryKeyRelatedField(
        queryset=Credentials.objects.all(),
        source='linked_credentials',
        allow_null=True,
        required=False,
        help_text="ID of the Credentials to link for email sending."
    )

    class Meta:
        model = TaskConfig
        fields = [
            'id',
            'user',
            'name',
            'task_type',
            'ai_provider',
            'ai_model_name',
            'prompt_template',
            'output_constraints',
            'refinement_iterations',
            'target_email_recipients',
            'email_subject_template',
            'linked_credentials_id', # Use this for input
            'linked_credentials',    # This will be used for output (nested representation if depth is set)
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'linked_credentials'] # linked_credentials is read-only as we use linked_credentials_id for writing

    def validate_ai_provider(self, value):
        # Example validation: ensure provider is one of the supported ones
        supported_providers = ['openai', 'gemini', 'anthropic']
        if value.lower() not in supported_providers:
            raise serializers.ValidationError(
                f"Unsupported AI provider. Must be one of: {', '.join(supported_providers)}"
            )
        return value

    def validate_refinement_iterations(self, value):
        if value < 0:
            raise serializers.ValidationError("Refinement iterations cannot be negative.")
        if value > 10: # Example upper limit
            raise serializers.ValidationError("Refinement iterations cannot exceed 10.")
        return value

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make linked_credentials_id write_only if you don't want it in the response
        # self.fields['linked_credentials_id'].write_only = True


class ScheduleSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    task_config = serializers.PrimaryKeyRelatedField(
        queryset=TaskConfig.objects.all(), # Will be customized in __init__
        help_text="ID of the TaskConfig to schedule."
    )

    class Meta:
        model = Schedule
        fields = [
            'id',
            'user',
            'task_config',
            'frequency',
            'cron_expression',
            'next_run_at',
            'last_run_at',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user', 'last_run_at', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            self.fields['task_config'].queryset = TaskConfig.objects.filter(user=request.user)
        else:
            # Handle cases where request or user is not available, e.g. during schema generation
            # Or raise an error if user context is strictly required.
            self.fields['task_config'].queryset = TaskConfig.objects.none()


    def validate(self, data):
        frequency = data.get('frequency')
        cron_expression = data.get('cron_expression')
        next_run_at = data.get('next_run_at')

        if frequency == Schedule.FREQUENCY_CRON and not cron_expression:
            raise serializers.ValidationError({
                'cron_expression': "This field is required when frequency is 'cron'."
            })
        
        if frequency == Schedule.FREQUENCY_CRON and cron_expression:
            # Placeholder for cron expression validation
            # from croniter import croniter
            # if not croniter.is_valid(cron_expression):
            #     raise serializers.ValidationError({'cron_expression': "Invalid cron expression."})
            pass


        if frequency == Schedule.FREQUENCY_ONCE and not next_run_at:
            raise serializers.ValidationError({
                'next_run_at': "This field is required when frequency is 'once'."
            })

        # Ensure cron_expression is null if frequency is not 'cron'
        if frequency != Schedule.FREQUENCY_CRON and cron_expression is not None:
             data['cron_expression'] = None # Or raise validation error if it should not be provided

        return data