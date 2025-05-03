# Celery Documentation: Setup, Tasks, Scheduling (Beat), Workers, Flask Integration

## Embedding Celery Beat within a Worker Process
DESCRIPTION: This console command starts a Celery worker and embeds the beat scheduler within the same process using the `-B` option. This is convenient for simple setups with only one worker node but is generally not recommended for production environments, especially those with multiple workers, as it can lead to duplicate task scheduling.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_14
LANGUAGE: console
```console
$ celery -A proj worker -B
```

---

## Starting the Celery Beat Scheduler Service
DESCRIPTION: This console command starts the Celery beat service, which is responsible for triggering scheduled tasks. It requires the Celery application instance (`proj`) to be specified using the `-A` flag. Celery beat reads the schedule configuration and sends tasks to the message queue at the appropriate times.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_13
LANGUAGE: console
```console
$ celery -A proj beat
```

---

## Starting Celery Beat with DatabaseScheduler
DESCRIPTION: Command to start the Celery beat service using the Django database scheduler provided by django-celery-beat, which enables storage of task schedules in the Django database.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_19
LANGUAGE: console
```console
$ celery -A proj beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

---

## Registering Periodic Tasks Programmatically using Celery in Python
DESCRIPTION: This code shows how to programmatically register multiple periodic tasks in Celery using the `on_after_configure` signal handler. Tasks are scheduled using both interval (seconds) and crontab-based approaches, with names to avoid accidental replacement. The example defines simple `test` and `add` task functions for demonstration. Celery must be installed, and this setup should be used in your Celery application initialization.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_2
LANGUAGE: python
```python
from celery import Celery
from celery.schedules import crontab

app = Celery()

@app.on_after_configure.connect
def setup_periodic_tasks(sender: Celery, **kwargs):
    # Calls test('hello') every 10 seconds.
    sender.add_periodic_task(10.0, test.s('hello'), name='add every 10')

    # Calls test('hello') every 30 seconds.
    # It uses the same signature of previous task, an explicit name is
    # defined to avoid this task replacing the previous one defined.
    sender.add_periodic_task(30.0, test.s('hello'), name='add every 30')

    # Calls test('world') every 30 seconds
    sender.add_periodic_task(30.0, test.s('world'), expires=10)

    # Executes every Monday morning at 7:30 a.m.
    sender.add_periodic_task(
        crontab(hour=7, minute=30, day_of_week=1),
        test.s('Happy Mondays!'),
    )

@app.task
def test(arg):
    print(arg)

@app.task
def add(x, y):
    z = x + y
    print(z)
```

---

## Getting Scheduled Tasks from Workers
DESCRIPTION: Python code to retrieve scheduled (ETA) tasks from workers using the inspect interface. Shows how to get information about tasks scheduled to run at a specific time.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/workers.rst#2025-04-23_snippet_36
LANGUAGE: pycon
```python
>>> i.scheduled()
[{'worker1.example.com':
    [{'eta': '2010-06-07 09:07:52', 'priority': 0,
      'request': {
        'name': 'tasks.sleeptask',
        'id': '1a7980ea-8b19-413e-91d2-0b74f3844c4d',
        'args': '[1]',
        'kwargs': '{}'}},
     {'eta': '2010-06-07 09:07:53', 'priority': 0,
      'request': {
        'name': 'tasks.sleeptask',
        'id': '49661b9a-aa22-4120-94b7-9ee8031d219d',
        'args': '[2]',
        'kwargs': '{}'}}]}]
```

---

## Starting Celery Beat with a Custom Schedule Database File
DESCRIPTION: This console command starts the Celery beat service while specifying a custom path for its schedule database file using the `-s` (or `--schedule`) option. Beat uses this file (a shelve database) to store the last run times of periodic tasks. By default, it's named `celerybeat-schedule` in the current directory.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_15
LANGUAGE: console
```console
$ celery -A proj beat -s /home/celery/var/run/celerybeat-schedule
```

---

## Using Crontab Schedules for Periodic Task Execution in Celery (Python)
DESCRIPTION: This snippet exemplifies configuring a periodic task using a `crontab` schedule expression in Celery's application configuration. The `schedule` field is set to execute a task every Monday morning at 7:30 a.m. The `args` tuple specifies the parameters to the task. The `crontab` helper from `celery.schedules` must be imported. This approach requires Celery to be set up and initialized, and is suitable for more complex scheduling requirements.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_4
LANGUAGE: python
```python
from celery.schedules import crontab

app.conf.beat_schedule = {
    # Executes every Monday morning at 7:30 a.m.
    'add-every-monday-morning': {
        'task': 'tasks.add',
        'schedule': crontab(hour=7, minute=30, day_of_week=1),
        'args': (16, 16),
    },
}
```

---

## Creating and Starting a Celery Worker in a Python Module
DESCRIPTION: Defines a standard pattern for encapsulating Celery app setup and task definition within a Python module file, and demonstrates running the worker from the main entry point. Prerequisites: celery package installed, proper module/script execution. Key parameters are the worker command-line args passed to worker_main. 'add' sums two arguments as a simple test task. Intended for demonstration/testing of Celery worker invocation from a script file context.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/application.rst#2025-04-23_snippet_2
LANGUAGE: python
```python
from celery import Celery
app = Celery()

@app.task
def add(x, y): return x + y

if __name__ == '__main__':
    args = ['worker', '--loglevel=INFO']
    app.worker_main(argv=args)
```

---

## Configuring Periodic Tasks with beat_schedule Setting in Celery (Python)
DESCRIPTION: This snippet configures periodic tasks using the `beat_schedule` setting directly on the Celery app configuration. The snippet shows the complete dictionary structure for registering a recurring task (`tasks.add`) with execution every 30 seconds and arguments passed to the task. Set `app.conf.timezone` as appropriate. All settings must be applied to the Celery app before workers and the beat process are started. Celery must be installed and initialized beforehand.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_3
LANGUAGE: python
```python
app.conf.beat_schedule = {
    'add-every-30-seconds': {
        'task': 'tasks.add',
        'schedule': 30.0,
        'args': (16, 16)
    },
}
app.conf.timezone = 'UTC'
```

---

## Configuring Celery Beat Schedule with Solar Events
DESCRIPTION: This Python snippet demonstrates how to configure the Celery beat schedule (`app.conf.beat_schedule`) to run a task based on a solar event. It uses `celery.schedules.solar` to trigger the 'tasks.add' task at sunset in Melbourne, Australia, specified by its latitude and longitude. The `solar` function takes the event type ('sunset'), latitude, and longitude as arguments.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_12
LANGUAGE: python
```python
from celery.schedules import solar

app.conf.beat_schedule = {
    # Executes at sunset in Melbourne
    'add-at-melbourne-sunset': {
        'task': 'tasks.add',
        'schedule': solar('sunset', -37.81753, 144.96715),
        'args': (16, 16),
    },
}
```

---

## Configuring Celery Beat for Broadcast Task in Python
DESCRIPTION: This Python code snippet sets up Celery Beat to periodically execute a task (`tasks.reload_cache`) using broadcast routing. It configures a broadcast queue and defines a `beat_schedule` entry. The schedule uses `crontab` for timing and specifies the 'broadcast_tasks' exchange in the `options` to ensure the task is sent as a broadcast.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/routing.rst#_snippet_19
LANGUAGE: Python
```python
from kombu.common import Broadcast
from celery.schedules import crontab

app.conf.task_queues = (Broadcast('broadcast_tasks'),)

app.conf.beat_schedule = {
    'test-task': {
        'task': 'tasks.reload_cache',
        'schedule': crontab(minute=0, hour='*/3'),
        'options': {'exchange': 'broadcast_tasks'}
    },
}
```

---

## Scheduling Celery Task on Even Days of the Month using Crontab
DESCRIPTION: This Python snippet demonstrates using `celery.schedules.crontab` to schedule a task to run at midnight (00:00) on every even-numbered day of the month, from the 2nd to the 30th.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_8
LANGUAGE: python
```python
crontab(0, 0, day_of_month='2-30/2')
```

---

## Enabling Late Acknowledgment and Disabling Prefetch in Workers (Python)
DESCRIPTION: This snippet provides the recommended Celery configuration for enabling late task acknowledgment (task_acks_late) and limiting worker prefetching to one (worker_prefetch_multiplier = 1). This setup ensures that workers commit to processing at most one unacknowledged task per process, enabling reliable retries on failure while requiring tasks to be idempotent. Both parameters are standard Celery settings placed in the project configuration file.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/optimizing.rst#2025-04-23_snippet_3
LANGUAGE: python
```python
task_acks_late = True
worker_prefetch_multiplier = 1
```

---

## Scheduling Celery Task Hourly with Multiple Conditions using Crontab
DESCRIPTION: This Python snippet shows how to configure a Celery task using `celery.schedules.crontab` to execute at minute 0 of every hour that is divisible by 3, *and* also every hour between 8am (inclusive) and 5pm (inclusive, representing 17:00).
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_6
LANGUAGE: python
```python
crontab(minute=0, hour='*/3,8-17')
```

---

## Scheduling Task in Worker Bootstep Using Timer (Python)
DESCRIPTION: This snippet demonstrates how to use the worker's Timer component within a custom bootstep. It shows how to schedule a function (`detect`) to run at regular intervals using `worker.timer.call_repeatedly` in the `start` method and how to cancel it in the `stop` method.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/extending.rst#_snippet_9
LANGUAGE: python
```python
from celery import bootsteps


class DeadlockDetection(bootsteps.StartStopStep):
    requires = {'celery.worker.components:Timer'}

    def __init__(self, worker, deadlock_timeout=3600):
        self.timeout = deadlock_timeout
        self.requests = []
        self.tref = None

    def start(self, worker):
        # run every 30 seconds.
        self.tref = worker.timer.call_repeatedly(
            30.0, self.detect, (worker,), priority=10,
        )

    def stop(self, worker):
        if self.tref:
            self.tref.cancel()
            self.tref = None

    def detect(self, worker):
        # update active requests
        for req in worker.active_requests:
            if req.time_start and time() - req.time_start > self.timeout:
                raise SystemExit()
```

---

## Scheduling Celery Task Monthly on a Specific Day using Crontab
DESCRIPTION: This Python snippet configures a Celery task using `celery.schedules.crontab` to execute at midnight (00:00) on the second day of every month.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_7
LANGUAGE: python
```python
crontab(0, 0, day_of_month='2')
```

---

## Customizing Worker Setup Using celeryd_after_setup Signal in Celery (Python)
DESCRIPTION: This snippet shows how to connect a handler to the celeryd_after_setup signal to customize a worker during its setup phase in Celery. The setup_direct_queue function uses the sender (the node name of the worker) to create a unique direct queue for the worker and registers it via app.amqp.queues.select_add. Required dependencies are Celery and a custom worker process; the function receives sender and instance arguments, and can modify the worker before it starts processing tasks. This pattern is suitable for enforcing custom queue topologies or worker-specific setup logic.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/signals.rst#2025-04-23_snippet_2
LANGUAGE: python
```python
from celery.signals import celeryd_after_setup

@celeryd_after_setup.connect
def setup_direct_queue(sender, instance, **kwargs):
    queue_name = '{0}.dq'.format(sender)  # sender is the nodename of the worker
    instance.app.amqp.queues.select_add(queue_name)

```

---

## Scheduling Celery Task During Specific Weeks of the Month using Crontab
DESCRIPTION: This Python snippet configures a Celery task with `celery.schedules.crontab` to execute at midnight (00:00) on days belonging to the first week (days 1-7) and the third week (days 15-21) of every month.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_9
LANGUAGE: python
```python
crontab(0, 0, day_of_month='1-7,15-21')
```

---

## Scheduling Celery Task Hourly Divisible by 5 using Crontab
DESCRIPTION: This Python snippet demonstrates how to configure a Celery task to run every hour that is divisible by 5 (e.g., 00:00, 05:00, 10:00, 15:00, 20:00) using the `celery.schedules.crontab` function. The task runs at minute 0 of the specified hours.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_5
LANGUAGE: python
```python
crontab(minute=0, hour='*/5')
```

---

## Getting Reserved Tasks from Workers
DESCRIPTION: Python code to retrieve reserved tasks from workers using the inspect interface. Shows how to get information about tasks that have been received but are still waiting to be executed.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/workers.rst#2025-04-23_snippet_37
LANGUAGE: pycon
```python
>>> i.reserved()
[{'worker1.example.com':
    [{'name': 'tasks.sleeptask',
      'id': '32666e9b-809c-41fa-8e93-5ae0c80afbbf',
      'args': '(8,)',
      'kwargs': '{}'}]}]
```

---

## Getting Registered Tasks from Workers
DESCRIPTION: Python code to retrieve registered tasks from workers using the inspect interface. Shows how to get a list of task names registered in workers.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/workers.rst#2025-04-23_snippet_34
LANGUAGE: pycon
```python
>>> i.registered()
[{'worker1.example.com': ['tasks.add',
                          'tasks.sleeptask']}]
```

---

## Setting Timezone for Celery Scheduler in Python
DESCRIPTION: This snippet demonstrates how to set the timezone for the Celery scheduler globally within your Celery configuration. The `timezone` variable can be directly assigned (as shown) or set via the application's configuration object. Changing the timezone will alter when periodic tasks are scheduled, and requires compatible schedulers for automatic updates. This approach is dependency-free except for Celery itself; users must ensure third-party schedulers react properly to time zone changes.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_0
LANGUAGE: python
```python
timezone = 'Europe/London'
```

---

## Scheduling Celery Task Quarterly using Crontab
DESCRIPTION: This Python snippet configures a Celery task using `celery.schedules.crontab` to run at midnight (00:00) every day, but only during months that are divisible by 3 (effectively, the first month of each quarter: January, April, July, October).
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/periodic-tasks.rst#2025-04-23_snippet_11
LANGUAGE: python
```python
crontab(0, 0, month_of_year='*/3')
```

---

## Custom Task Schedule Implementation
DESCRIPTION: Example of implementing a custom schedule class for dynamic periodic task intervals
SOURCE: https://github.com/celery/celery/blob/main/docs/faq.rst#2025-04-23_snippet_12
LANGUAGE: python
```python
from celery.schedules import schedule

class my_schedule(schedule):

    def is_due(self, last_run_at):
        return run_now, next_time_to_check
```

---

## Defining systemd Service for Celery Beat Scheduler - Bash
DESCRIPTION: Provides a sample systemd service file to run Celery Beat as a managed service. The file configures environment, directories, user/group, and the command line for Beat, relying on variables set in an external conf.d file. Place in /etc/systemd/system/celerybeat.service. Prerequisites: systemd, Celery Beat, configured environment file. Outputs: continuously running Celery Beat scheduler as systemd service.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/daemonizing.rst#2025-04-23_snippet_11
LANGUAGE: bash
```bash
[Unit]
Description=Celery Beat Service
After=network.target

[Service]
Type=simple
User=celery
Group=celery
EnvironmentFile=/etc/conf.d/celery
WorkingDirectory=/opt/celery
ExecStart=/bin/sh -c '${CELERY_BIN} -A ${CELERY_APP} beat  \
    --pidfile=${CELERYBEAT_PID_FILE} \
    --logfile=${CELERYBEAT_LOG_FILE} --loglevel=${CELERYD_LOG_LEVEL}'
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## Routing Tasks to Specific Workers with worker_direct in Celery Python
DESCRIPTION: Example of routing a task to a specific worker using the worker_direct feature, which creates a dedicated queue for each worker.
SOURCE: https://github.com/celery/celery/blob/main/docs/userguide/configuration.rst#2025-04-23_snippet_45
LANGUAGE: python
```python
task_routes = {
    'tasks.add': {'exchange': 'C.dq2', 'routing_key': 'w1@example.com'}
}