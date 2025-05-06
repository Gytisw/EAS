# Celery Integration with Django and Redis

This document outlines the key steps for setting up Celery with a Django project, using Redis as the message broker and result backend.

## 1. Installation

Ensure Celery and the Redis client (as an extra for Celery) are installed in your Python environment:

```bash
pip install "celery[redis]" django
# Ensure redis-py is also installed if not pulled by celery[redis] for your version
pip install redis
```
Reference `TECH_STACK.md` for specific versions (Celery 5.5, Django 5.2, Redis server 8.0.0, Python 3.12).

## 2. Configuration

### a. Create `your_project_name/celery.py`

Next to your `your_project_name/settings.py`, create a `celery.py` file. Replace `your_project_name` with your actual Django project's name.

```python
# your_project_name/celery.py
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project_name.settings')

app = Celery('your_project_name')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
```

### b. Update `your_project_name/__init__.py`

To ensure the Celery app is loaded when Django starts, modify `your_project_name/__init__.py`:

```python
# your_project_name/__init__.py
from .celery import app as celery_app

__all__ = ('celery_app',)
```

### c. Configure Django Settings (`your_project_name/settings.py`)

Add Celery-specific configurations to your Django `settings.py` file.

```python
# your_project_name/settings.py

# Celery Configuration Options
# Ensure Redis server is running and accessible.
# Use different database numbers for broker and backend if possible.
CELERY_BROKER_URL = 'redis://localhost:6379/0'  # For Redis 8.0.0
CELERY_RESULT_BACKEND = 'redis://localhost:6379/1' # For Redis 8.0.0

CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC' # Or your project's timezone
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60 # Example: 30 minutes
```
*   **`CELERY_BROKER_URL`**: URL for the message broker (Redis).
*   **`CELERY_RESULT_BACKEND`**: URL for storing task results (Redis).
*   Other settings control serialization, timezone, and task behavior.

## 3. Defining Tasks

Create tasks in a `tasks.py` file within your Django apps. Use the `@shared_task` decorator so that your tasks can be used without a specific Celery app instance.

**Example: `your_app_name/tasks.py`**
```python
# your_app_name/tasks.py
from celery import shared_task
import time

# Example: A simple task
@shared_task
def add(x, y):
    return x + y

# Example: Task interacting with Django models (ensure app context)
from .models import YourModel # Assuming YourModel is in your_app_name/models.py

@shared_task
def process_model_instance(instance_id):
    try:
        instance = YourModel.objects.get(id=instance_id)
        # ... do something with the instance ...
        instance.processed = True
        instance.save()
        return f"Processed instance {instance_id}"
    except YourModel.DoesNotExist:
        return f"Instance {instance_id} not found."

@shared_task
def long_running_task():
    time.sleep(10) # Simulate a long task
    return "Long task complete!"
```
Remember to import these tasks where Celery can find them (handled by `app.autodiscover_tasks()` if tasks are in `tasks.py` files of installed apps).

## 4. Running Celery Workers

Start a Celery worker process from your project's root directory (where `manage.py` is located). Replace `your_project_name` with your actual Django project's name.

```bash
celery -A your_project_name worker -l info
```
*   `-A your_project_name`: Specifies the Celery application instance.
*   `worker`: Starts a worker process.
*   `-l info`: Sets the logging level to INFO. Other levels include DEBUG, WARNING, ERROR.

For development, you might run this in a separate terminal. For production, you'll use a process manager like Supervisor or systemd.

## 5. Calling Tasks

You can call Celery tasks from your Django views, signals, management commands, etc.

*   **`.delay(*args, **kwargs)`**: A shortcut to `.apply_async()`. Sends the task message.
    ```python
    # In your_app_name/views.py or elsewhere
    from .tasks import add, long_running_task

    def my_view(request):
        # ...
        result_object = add.delay(4, 4)
        print(f"Task ID: {result_object.id}") # Get the task ID

        long_running_task.delay()
        # ...
        return HttpResponse("Tasks initiated!")
    ```
*   **`.apply_async(args=[...], kwargs={...}, countdown=N, eta=datetime_obj, ...)`**: Provides more control over task execution (e.g., scheduling, retries).
    ```python
    from datetime import datetime, timedelta
    from .tasks import process_model_instance

    # Schedule a task to run 10 seconds from now
    process_model_instance.apply_async(args=[some_instance_id], countdown=10)

    # Schedule a task to run at a specific time
    # eta_time = datetime.utcnow() + timedelta(minutes=5)
    # process_model_instance.apply_async(args=[another_instance_id], eta=eta_time)
    ```

## Key Concepts & Links

*   **Celery App Instance:** The core `Celery` object defined in `celery.py`.
*   **Broker:** The message queue (Redis in this case) that holds tasks.
*   **Worker:** A process that consumes tasks from the queue and executes them.
*   **Shared Task (`@shared_task`):** Decorator for tasks that can be used by any Celery app instance, good for reusable tasks in Django apps.
*   **Result Backend:** Stores the state and return values of tasks (Redis in this case).
*   **Official Docs & Resources:**
    *   [Celery Project Documentation](https://docs.celeryq.dev/en/stable/)
    *   [First Steps with Django (Celery Docs)](https://docs.celeryq.dev/en/stable/django/first-steps-with-django.html)
    *   [Using Redis as a Broker (Celery Docs)](https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/redis.html)
    *   [Calling Tasks (Celery Docs)](https://docs.celeryq.dev/en/stable/userguide/calling.html)

This setup provides a basic but functional Celery integration with Django using Redis.