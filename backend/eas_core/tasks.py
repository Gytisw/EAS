# backend/eas_core/tasks.py
from celery import shared_task
from celery.utils.log import get_task_logger
import time
from django.utils import timezone
from datetime import timedelta
from croniter import croniter

from .models import TaskConfig, Schedule

logger = get_task_logger(__name__)

@shared_task(bind=True)
def simple_test_task(self, x, y):
    """
    A simple test task that adds two numbers.
    """
    logger.info(f"Task simple_test_task (ID: {self.request.id}) received: x={x}, y={y}")
    result = x + y
    logger.info(f"Task simple_test_task (ID: {self.request.id}) result: {result}")
    return result

@shared_task(bind=True)
def long_test_task(self):
    """
    A simple test task that simulates a long-running operation.
    """
    logger.info(f"Task long_test_task (ID: {self.request.id}) started.")
    time.sleep(10) # Simulate 10 seconds of work
    logger.info(f"Task long_test_task (ID: {self.request.id}) finished after 10 seconds.")
    return "Long task complete!"

@shared_task(bind=True)
def execute_scheduled_task(self, task_config_id):
    """
    Executes a configured TaskConfig.
    """
    logger.info(f"Task execute_scheduled_task (ID: {self.request.id}) received: task_config_id={task_config_id}")
    try:
        task_config = TaskConfig.objects.get(id=task_config_id)
        logger.info(f"Executing TaskConfig ID: {task_config.id}, Name: {task_config.name}, Prompt: {task_config.prompt_template}")
        # Placeholder for actual AI execution logic
        # Simulate execution
        time.sleep(5)
        logger.info(f"Successfully executed TaskConfig ID: {task_config.id}")
        return f"Successfully executed TaskConfig ID: {task_config.id}"
    except TaskConfig.DoesNotExist:
        logger.error(f"TaskConfig with ID {task_config_id} not found.")
        return f"TaskConfig with ID {task_config_id} not found."
    except Exception as e:
        logger.error(f"Error executing TaskConfig ID {task_config_id}: {e}", exc_info=True)
        # Re-raise the exception to mark the task as failed
        raise

@shared_task(bind=True)
def check_and_dispatch_due_schedules(self):
    """
    Checks for due schedules and dispatches them to Celery workers.
    Updates schedule instances after dispatch.
    """
    now = timezone.now()
    logger.info(f"Task check_and_dispatch_due_schedules (ID: {self.request.id}) started at {now}.")

    due_schedules = Schedule.objects.filter(is_active=True, next_run_at__lte=now)
    logger.info(f"Found {due_schedules.count()} due schedules.")

    for schedule in due_schedules:
        logger.info(f"Processing schedule ID: {schedule.id} for TaskConfig ID: {schedule.task_config.id}")
        try:
            # Dispatch the task
            execute_scheduled_task.delay(schedule.task_config.id)
            logger.info(f"Dispatched execute_scheduled_task for TaskConfig ID: {schedule.task_config.id} from Schedule ID: {schedule.id}")

            # Update schedule
            schedule.last_run_at = now
            
            if schedule.frequency == Schedule.FREQUENCY_ONCE:
                schedule.is_active = False
                schedule.next_run_at = None # Or keep it as the last run time for history
                logger.info(f"Schedule ID: {schedule.id} was a 'once' schedule, now inactive.")
            elif schedule.frequency == Schedule.FREQUENCY_DAILY:
                schedule.next_run_at = now + timedelta(days=1)
            elif schedule.frequency == Schedule.FREQUENCY_WEEKLY:
                schedule.next_run_at = now + timedelta(weeks=1)
            elif schedule.frequency == Schedule.FREQUENCY_MONTHLY:
                # This is a simplistic approach for monthly; for more complex scenarios,
                # consider dateutil.relativedelta or handling month ends carefully.
                # For now, adding 30 days as an approximation.
                schedule.next_run_at = now + timedelta(days=30) # Approximation
            elif schedule.frequency == Schedule.FREQUENCY_CRON:
                if schedule.cron_expression:
                    # Use last_run_at (which is now) as the base for the next cron iteration
                    # Ensure 'now' is timezone-aware if USE_TZ=True, croniter expects aware datetime
                    base_time_for_cron = now
                    if settings.USE_TZ and timezone.is_naive(base_time_for_cron):
                        default_tz = timezone.get_default_timezone()
                        base_time_for_cron = timezone.make_aware(base_time_for_cron, default_tz)

                    cron_it = croniter(schedule.cron_expression, base_time_for_cron)
                    next_run_dt_cron = cron_it.get_next(datetime)

                    if settings.USE_TZ and timezone.is_naive(next_run_dt_cron):
                        default_tz = timezone.get_default_timezone()
                        schedule.next_run_at = timezone.make_aware(next_run_dt_cron, default_tz)
                    else:
                        schedule.next_run_at = next_run_dt_cron
                else:
                    logger.warning(f"Schedule ID: {schedule.id} has 'cron' frequency but no cron_expression. Deactivating.")
                    schedule.is_active = False
                    schedule.next_run_at = None

            schedule.save()
            logger.info(f"Updated Schedule ID: {schedule.id}. Next run at: {schedule.next_run_at}, Is active: {schedule.is_active}")

        except Exception as e:
            logger.error(f"Error processing Schedule ID {schedule.id}: {e}", exc_info=True)
            # Decide if the schedule should be deactivated or retried later based on the error
            # For now, we'll let it be picked up again if next_run_at isn't updated or is in the past.

    logger.info(f"Task check_and_dispatch_due_schedules (ID: {self.request.id}) finished.")
    return f"Checked and dispatched {due_schedules.count()} schedules."