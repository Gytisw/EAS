# Structured Logging for Django & Celery (JSON)

This document outlines how to set up structured JSON logging for a Django application and its Celery workers, promoting better log analysis and monitoring.

## 1. Using `python-json-logger`

A popular library for JSON logging is `python-json-logger`.

**Installation:**
```bash
pip install python-json-logger
```

## 2. Django Logging Configuration (`settings.py`)

Modify the `LOGGING` dictionary in your Django `settings.py`.

```python
# settings.py
import os

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False, # Keep Django's default loggers
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(levelname)s %(name)s %(module)s %(funcName)s %(lineno)d %(message)s %(pathname)s %(process)d %(thread)d %(correlation_id)s %(task_id)s %(task_name)s',
            # You can add more default fields or customize the format string
            # Example: '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'verbose': { # A standard formatter for console, if needed for non-JSON output
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console_json': { # Handler for JSON output to console
            'class': 'logging.StreamHandler',
            'formatter': 'json', # Use the JSON formatter
        },
        'console_simple': { # Optional: A simple formatter for basic console output
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': { # Django's own logs
            'handlers': ['console_json'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': True, # Send to parent loggers
        },
        'django.request': { # Logs for requests, including 5XX errors
            'handlers': ['console_json'],
            'level': 'WARNING', # Or 'ERROR' for less verbosity
            'propagate': False, # Don't send to 'django' logger if handled here
        },
        'celery': { # Celery's own logs
            'handlers': ['console_json'],
            'level': os.getenv('CELERY_LOG_LEVEL', 'INFO'),
            'propagate': True,
        },
        'your_project_name': { # Your application's specific logger
            'handlers': ['console_json'],
            'level': os.getenv('APP_LOG_LEVEL', 'DEBUG'), # More verbose for your app in dev
            'propagate': False, # Avoid duplicate logs if 'django' logger also handles it
        },
        # Example for a specific app within your project
        # 'your_app_name': {
        #     'handlers': ['console_json'],
        #     'level': 'DEBUG',
        #     'propagate': False,
        # },
    },
    # Root logger - catches everything not caught by specific loggers
    # 'root': {
    #     'handlers': ['console_json'],
    #     'level': 'WARNING',
    # }
}
```

**Explanation:**
*   **`formatters.json`**: Defines how log records are turned into JSON. `pythonjsonlogger.jsonlogger.JsonFormatter` is used. The `format` string specifies which standard `LogRecord` attributes are included by default in the JSON output.
*   **`handlers.console_json`**: Sends JSON formatted logs to `stdout` (the console).
*   **`loggers`**:
    *   `django`: Catches general Django logs.
    *   `django.request`: Specifically for request handling, useful for errors.
    *   `celery`: For Celery's internal logs.
    *   `your_project_name` (replace with your actual project name): A logger for your application code. You can create more granular loggers (e.g., `your_project_name.myapp.views`).
*   **Log Levels**: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`.
*   **`propagate`**: If `True`, messages are passed to handlers of parent loggers.

## 3. Celery Logging Integration

Celery uses Python's standard `logging` module. If Django's `LOGGING` setting is configured *before* Celery initializes its app, Celery should pick it up.

### a. Ensure Django Settings are Loaded (`your_project_name/celery.py`)

Your `celery.py` file should already be loading Django settings:
```python
# your_project_name/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project_name.settings')
app = Celery('your_project_name')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
# ...
```
This `app.config_from_object('django.conf:settings', namespace='CELERY')` line is key for Celery to be aware of Django's logging (among other settings).

### b. Using Task Logger

Celery provides a logger specifically for tasks that automatically includes `task_id` and `task_name`.

```python
# your_app_name/tasks.py
from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__) # Standard way to get a logger for the current module

@shared_task(bind=True) # bind=True gives access to self (the task instance)
def my_celery_task(self, x, y):
    # self.request.id is the task ID
    # self.name is the task name (e.g., 'your_app_name.tasks.my_celery_task')
    logger.info(f"Task started: id={self.request.id}, name={self.name}, args=({x}, {y})")
    try:
        result = x + y
        logger.info(f"Task {self.request.id} finished successfully with result: {result}")
        return result
    except Exception as e:
        logger.error(f"Task {self.request.id} failed: {e}", exc_info=True) # exc_info=True includes traceback
        raise # Re-raise the exception if you want Celery to mark it as FAILED
```
If `python-json-logger` is configured correctly in Django, these logs from `get_task_logger` should also be in JSON format and include `task_id` and `task_name` if they are part of the formatter string or if `python-json-logger` adds them by default.

### c. Celery Logging Signals (Advanced)

For more fine-grained control, Celery provides signals like `setup_logging` and `after_setup_logger`.
```python
# your_project_name/celery.py
# ... (other imports and app definition) ...
from celery.signals import after_setup_logger, after_setup_task_logger

# @after_setup_logger.connect
# def setup_celery_logger(logger, **kwargs):
#     # Example: Add a specific handler or filter to all Celery loggers
#     # This is generally not needed if Django's LOGGING is picked up correctly.
#     pass

# @after_setup_task_logger.connect
# def setup_celery_task_logger(logger, **kwargs):
#     # Example: Add specific handler or filter to task loggers
#     pass
```
Usually, relying on Django's `LOGGING` configuration being picked up by Celery is sufficient.

## 4. Adding Custom Fields to JSON Logs (e.g., Correlation ID)

To add custom fields like a `correlation_id` (useful for tracing requests across services/tasks):

### a. Middleware for Django Requests

Create a middleware to generate/propagate a correlation ID.
```python
# your_project_name/middleware.py
import uuid
import logging

# Get a logger for the middleware itself if needed
logger = logging.getLogger(__name__)

# Thread-local storage for the correlation ID
try:
    from threading import local
except ImportError:
    from django.utils._threading_local import local

_thread_locals = local()

def get_correlation_id():
    return getattr(_thread_locals, 'correlation_id', None)

class CorrelationIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Try to get correlation_id from request headers (e.g., X-Correlation-ID)
        # or generate a new one
        correlation_id = request.META.get('HTTP_X_CORRELATION_ID', str(uuid.uuid4()))
        _thread_locals.correlation_id = correlation_id

        response = self.get_response(request)

        # Add correlation_id to response headers
        response['X-Correlation-ID'] = correlation_id
        
        # Clean up (optional, depending on thread local behavior with your server)
        # delattr(_thread_locals, 'correlation_id')
        return response
```
Add this middleware to `settings.MIDDLEWARE` (ideally early in the list).

### b. Custom LogRecord Factory or Filter

To inject `correlation_id` into all log records:
```python
# settings.py (or a separate logging_setup.py imported by settings)

# ... (previous LOGGING setup) ...

# Store original LogRecord factory
_old_log_record_factory = logging.getLogRecordFactory()

def record_factory_with_correlation_id(*args, **kwargs):
    record = _old_log_record_factory(*args, **kwargs)
    record.correlation_id = get_correlation_id() # From middleware
    # For Celery tasks, task_id and task_name are often added by Celery's logger
    # but you can ensure they are present if needed, though it's better if Celery handles its own.
    # record.task_id = getattr(self.request, 'id', None) # If in a Celery task context
    # record.task_name = getattr(self.request, 'task', None)
    return record

logging.setLogRecordFactory(record_factory_with_correlation_id)

# Alternatively, use a logging.Filter
# class CorrelationIDFilter(logging.Filter):
#     def filter(self, record):
#         record.correlation_id = get_correlation_id()
#         return True

# And add this filter to your handlers in LOGGING settings:
# 'handlers': {
#     'console_json': {
#         'class': 'logging.StreamHandler',
#         'formatter': 'json',
#         'filters': ['correlation_id_filter'], # Add filter here
#     },
# },
# 'filters': {
#     'correlation_id_filter': {
#         '()': 'your_project_name.logging_setup.CorrelationIDFilter', # Path to your filter
#     }
# },
```
Ensure your JSON formatter includes `%(correlation_id)s`.

### c. Propagating Correlation ID to Celery Tasks

When calling Celery tasks, you can pass the `correlation_id`.
```python
# views.py
from .tasks import my_celery_task
from .middleware import get_correlation_id # Or however you access it

def my_view(request):
    correlation_id = get_correlation_id()
    # Pass it to the task, perhaps in its headers or as an argument
    my_celery_task.apply_async(args=(1, 2), headers={'correlation_id': correlation_id})
    # ...
```
Inside the Celery task, you'd then need to extract this and potentially set it in a task-local context if you want it automatically in logs for that task execution, or explicitly log it. `python-json-logger` can sometimes pick up task-related attributes if Celery's logging setup is compatible.

## 5. Key Information to Log

Common fields for structured logs:
*   `timestamp` (e.g., `%(asctime)s`)
*   `level` (e.g., `%(levelname)s`)
*   `logger_name` (e.g., `%(name)s`)
*   `message` (e.g., `%(message)s`)
*   `module` (e.g., `%(module)s`)
*   `function_name` (e.g., `%(funcName)s`)
*   `line_number` (e.g., `%(lineno)d`)
*   `pathname` (e.g., `%(pathname)s`)
*   `process_id` (e.g., `%(process)d`)
*   `thread_id` (e.g., `%(thread)d`)
*   `correlation_id` (custom, for tracing requests)
*   `user_id` (custom, if applicable)
*   `task_id` (for Celery tasks, e.g., `%(task_id)s` or `%(task_name)s` if Celery's logger adds them)
*   `task_name` (for Celery tasks)
*   `exception_type` (if logging an exception)
*   `stack_trace` (if logging an exception)

## Official Docs & Resources

*   [Django Logging Documentation](https://docs.djangoproject.com/en/stable/topics/logging/)
*   [Python `logging` module](https://docs.python.org/3/library/logging.html)
*   [Celery Logging Documentation](https://docs.celeryq.dev/en/stable/userguide/logging.html)
*   [`python-json-logger` GitHub](https://github.com/madzak/python-json-logger)

This setup provides a robust foundation for structured JSON logging in your Django and Celery application. Remember to adjust paths and names (like `your_project_name`) to match your project.