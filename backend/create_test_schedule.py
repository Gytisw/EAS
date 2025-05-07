import os
import django
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

# Initialize Django environment if running as a standalone script
# This might be needed if not running via manage.py shell < script.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eas_backend.settings')
django.setup()

from eas_core.models import TaskConfig, Schedule

def create_data():
    User = get_user_model()
    user = User.objects.first()

    if not user:
        print("No user found in the database. Please create a user (e.g., superuser) first.")
        return None, None
    else:
        print(f"Using user: {user.username}")

        # Create a TaskConfig
        task_config, created = TaskConfig.objects.get_or_create(
            user=user,
            name="Celery Beat Test TaskConfig",
            defaults={
                'task_type': 'test_execution',
                'ai_provider': 'test_provider',
                'prompt_template': 'This is a test prompt for Celery Beat execution.',
                'output_constraints': {"format": "text"},
                'refinement_iterations': 1,
            }
        )
        if created:
            print(f"Created TaskConfig: {task_config.name} (ID: {task_config.id})")
        else:
            print(f"Found existing TaskConfig: {task_config.name} (ID: {task_config.id})")

        # Calculate next_run_at (e.g., 1 minute from now)
        now_utc = timezone.now()
        next_run_time = now_utc + timedelta(minutes=1)

        # Create a Schedule
        schedule = Schedule.objects.create(
            user=user,
            task_config=task_config,
            frequency='once', # Test with 'once' first
            next_run_at=next_run_time,
            is_active=True
        )
        print(f"Created Schedule (ID: {schedule.id}) for TaskConfig '{task_config.name}' set to run at {schedule.next_run_at} (UTC).")
        print(f"Current UTC time is: {now_utc}")
        print("Please monitor Celery Beat and Celery Worker logs for the next ~2 minutes.")
        return task_config.id, schedule.id

if __name__ == '__main__':
    task_config_id, schedule_id = create_data()
    if task_config_id and schedule_id:
        print(f"--- Script Finished ---")
        print(f"TaskConfig ID: {task_config_id}")
        print(f"Schedule ID: {schedule_id}")
        print(f"Keep this terminal open if you want to re-enter shell later, or Ctrl+C to exit if running directly.")