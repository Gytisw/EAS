# Django Documentation: Project Setup, Apps, Models, ORM Basics, Views, Templates, URL Routing, Settings

## Configuring Django INSTALLED_APPS Setting
DESCRIPTION: This code snippet shows how to add the polls app to the INSTALLED_APPS setting in the Django project's settings.py file. This is necessary to include the app in the project.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial02.txt#2025-04-23_snippet_1
LANGUAGE: python
```python
INSTALLED_APPS = [
    "polls.apps.PollsConfig",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]
```

---

## Configuring Django URL Patterns
DESCRIPTION: Sets up URL routing for a polls application by mapping URL patterns to view functions using Django's path() function. Includes patterns for index, detail, results and vote views.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial03.txt#2025-04-23_snippet_1
LANGUAGE: python
```python
from django.urls import path

from . import views

urlpatterns = [
    # ex: /polls/
    path("", views.index, name="index"),
    # ex: /polls/5/
    path("<int:question_id>/", views.detail, name="detail"),
    # ex: /polls/5/results/
    path("<int:question_id>/results/", views.results, name="results"),
    # ex: /polls/5/vote/
    path("<int:question_id>/vote/", views.vote, name="vote"),
]
```

---

## Querying and Deleting Django Model Instances
DESCRIPTION: This snippet demonstrates how to query a Django model and delete specific instances using the ORM. It filters choices based on text content and then deletes the filtered results.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial02.txt#2025-04-23_snippet_8
LANGUAGE: python
```python
>>> c = q.choice_set.filter(choice_text__startswith="Just hacking")
>>> c.delete()
```

---

## Implementing Basic Django View for Polls Index
DESCRIPTION: Creates a view function that retrieves the latest 5 questions and renders them using a template. Uses Django's render shortcut function to combine template with context data.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial03.txt#2025-04-23_snippet_5
LANGUAGE: python
```python
from django.shortcuts import render

from .models import Question


def index(request):
    latest_question_list = Question.objects.order_by("-pub_date")[:5]
    context = {"latest_question_list": latest_question_list}
    return render(request, "polls/index.html", context)
```

---

## Basic Question Detail Template
DESCRIPTION: Simple template that displays the question object for the detail view.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial03.txt#2025-04-23_snippet_7
LANGUAGE: html+django
```html+django
{{ question }}
```

---

## Django URL Pattern Configuration
DESCRIPTION: Defines URL routing for the 'item_list' view, associating a URL pattern with the corresponding view function. Uses Django's urls module to map URL to view, enabling web navigation to the item list page.
SOURCE: https://github.com/django/django/blob/main/tests/view_tests/media/%2F.txt#_snippet_2
LANGUAGE: Python
```python
urlpatterns = [
    path('items/', views.item_list, name='item_list'),
]
```

---

## Advanced Django ORM Queries and Related Objects
DESCRIPTION: This Python code showcases advanced Django ORM queries, including filtering, accessing related objects through foreign keys, and creating related objects. It demonstrates the power and flexibility of Django's database API.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial02.txt#2025-04-23_snippet_7
LANGUAGE: python
```python
# Make sure our __str__() addition worked.
>>> Question.objects.all()
<QuerySet [<Question: What's up?>]>

# Django provides a rich database lookup API that's entirely driven by
# keyword arguments.
>>> Question.objects.filter(id=1)
<QuerySet [<Question: What's up?>]>
>>> Question.objects.filter(question_text__startswith="What")
<QuerySet [<Question: What's up?>]>

# Get the question that was published this year.
>>> from django.utils import timezone
>>> current_year = timezone.now().year
>>> Question.objects.get(pub_date__year=current_year)
<Question: What's up?>

# Request an ID that doesn't exist, this will raise an exception.
>>> Question.objects.get(id=2)
Traceback (most recent call last):
    ...
DoesNotExist: Question matching query does not exist.

# Lookup by a primary key is the most common case, so Django provides a
# shortcut for primary-key exact lookups.
# The following is identical to Question.objects.get(id=1).
>>> Question.objects.get(pk=1)
<Question: What's up?>

# Make sure our custom method worked.
>>> q = Question.objects.get(pk=1)
>>> q.was_published_recently()
True

# Give the Question a couple of Choices. The create call constructs a new
# Choice object, does the INSERT statement, adds the choice to the set
# of available choices and returns the new Choice object. Django creates
# a set (defined as "choice_set") to hold the "other side" of a ForeignKey
# relation (e.g. a question's choice) which can be accessed via the API.
>>> q = Question.objects.get(pk=1)

# Display any choices from the related object set -- none so far.
>>> q.choice_set.all()
<QuerySet []>

# Create three choices.
>>> q.choice_set.create(choice_text="Not much", votes=0)
<Choice: Not much>
>>> q.choice_set.create(choice_text="The sky", votes=0)
<Choice: The sky>
>>> c = q.choice_set.create(choice_text="Just hacking again", votes=0)

# Choice objects have API access to their related Question objects.
>>> c.question
<Question: What's up?>

# And vice versa: Question objects get access to Choice objects.
>>> q.choice_set.all()
<QuerySet [<Choice: Not much>, <Choice: The sky>, <Choice: Just hacking again>]>
>>> q.choice_set.count()
3

# The API automatically follows relationships as far as you need.
# Use double underscores to separate relationships.
# This works as many levels deep as you want; there's no limit.
# Find all Choices for any question whose pub_date is in this year
# (reusing the 'current_year' variable we created above).
>>> Choice.objects.filter(question__pub_date__year=current_year)
```

---

## Creating Basic Django Views with Parameters
DESCRIPTION: Defines three view functions that handle different URL patterns for a polls application. Each view takes a question_id parameter and returns an HTTP response.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial03.txt#2025-04-23_snippet_0
LANGUAGE: python
```python
def detail(request, question_id):
    return HttpResponse("You're looking at question %s." % question_id)


def results(request, question_id):
    response = "You're looking at the results of question %s."
    return HttpResponse(response % question_id)


def vote(request, question_id):
    return HttpResponse("You're voting on question %s." % question_id)
```

---

## URL Configuration with Namespacing
DESCRIPTION: Configures URL patterns with application namespace for the polls app to avoid naming conflicts.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial03.txt#2025-04-23_snippet_10
LANGUAGE: python
```python
from django.urls import path

from . import views

app_name = "polls"
urlpatterns = [
    path("", views.index, name="index"),
    path("<int:question_id>/", views.detail, name="detail"),
    path("<int:question_id>/results/", views.results, name="results"),
    path("<int:question_id>/vote/", views.vote, name="vote"),
]
```

---

## Template with Namespaced URL Tag
DESCRIPTION: Updated template using namespaced URL tag for linking to the detail view.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial03.txt#2025-04-23_snippet_11
LANGUAGE: html+django
```html+django
<li><a href="{% url 'polls:detail' question.id %}">{{ question.question_text }}</a></li>
```

---

## Adding Dependencies for Cross-App Model Access in Django Migrations
DESCRIPTION: Shows how to properly set up dependencies when a migration in one app needs to access models from another app. This ensures all required models are available during migration.
SOURCE: https://github.com/django/django/blob/main/docs/topics/migrations.txt#2025-04-23_snippet_10
LANGUAGE: python
```python
class Migration(migrations.Migration):
    dependencies = [
        ("app1", "0001_initial"),
        # added dependency to enable using models from app2 in move_m1
        ("app2", "0004_foobar"),
    ]

    operations = [
        migrations.RunPython(move_m1),
    ]
```

---

## Rendering Django Template with Context
DESCRIPTION: Updates the index view to use a template instead of hardcoded output. Loads the template, creates a context dictionary with data, and renders the template with the context.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial03.txt#2025-04-23_snippet_4
LANGUAGE: python
```python
from django.http import HttpResponse
from django.template import loader

from .models import Question


def index(request):
    latest_question_list = Question.objects.order_by("-pub_date")[:5]
    template = loader.get_template("polls/index.html")
    context = {"latest_question_list": latest_question_list}
    return HttpResponse(template.render(context, request))
```

---

## Configuring Django URLs for Static Files Development View (Python)
DESCRIPTION: This Python snippet demonstrates how to add a URL pattern to your Django project's `urlpatterns` to enable the static files development view (`views.serve`). This view should only be used when `settings.DEBUG` is `True` as it's inefficient and insecure for production. It uses `re_path` to match URLs starting with the value of `settings.STATIC_URL` (assumed to be `/static/` here) and passes the remaining path to the `views.serve` function. Requires `django.conf.settings`, `django.contrib.staticfiles.views`, and `django.urls.re_path`.
SOURCE: https://github.com/django/django/blob/main/docs/ref/contrib/staticfiles.txt#2025-04-23_snippet_5
LANGUAGE: python
```python
from django.conf import settings
from django.contrib.staticfiles import views
from django.urls import re_path

if settings.DEBUG:
    urlpatterns += [
        re_path(r"^static/(?P<path>.*)$", views.serve),
    ]
```

---

## Configuring DateDetailView URL Routing in Django (Python)
DESCRIPTION: This snippet shows how to define a URL route using Django's path() function to connect date-based detail URLs to the DateDetailView generic view. It uses Django's as_view() with 'model' and 'date_field' arguments to specify the model (Article) and the date field (pub_date) used for lookups. Dependencies include 'django.urls' and 'django.views.generic.dates.DateDetailView', and the Article model must be defined in the application. Inputs are requests to a URL matching the embedded pattern, and output is rendering an appropriate object detail page or raising a 404 if not found. This setup assumes the default template name structure with a '_detail' suffix.
SOURCE: https://github.com/django/django/blob/main/docs/ref/class-based-views/generic-date-based.txt#2025-04-23_snippet_12
LANGUAGE: python
```python
from django.urls import path
from django.views.generic.dates import DateDetailView

urlpatterns = [
    path(
        "<int:year>/<str:month>/<int:day>/<int:pk>/",
        DateDetailView.as_view(model=Article, date_field="pub_date"),
        name="archive_date_detail",
    ),
]
```

---

## Recommended Project Layout with External manage.py (Text)
DESCRIPTION: Illustrates the recommended Django 1.4 project directory structure where `manage.py` resides outside the main project package (`mysite`). This layout facilitates importing project components using the project name prefix (e.g., `mysite.settings`, `mysite.urls`).
SOURCE: https://github.com/django/django/blob/main/docs/releases/1.4.txt#2025-04-23_snippet_1
LANGUAGE: text
```text
manage.py
mysite/
    __init__.py
    settings.py
    urls.py
    myapp/
        __init__.py
        models.py
```

---

## Configuring Django Template Settings for Project-Level Overrides
DESCRIPTION: This snippet shows how to configure Django settings to enable template overriding at the project level. It includes setting up INSTALLED_APPS with the app whose templates you want to override and configuring the TEMPLATES setting with the project's templates directory.
SOURCE: https://github.com/django/django/blob/main/docs/howto/overriding-templates.txt#2025-04-23_snippet_0
LANGUAGE: python
```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

INSTALLED_APPS = [
    ...,
    "blog",
    ...,
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        # ...
    },
]
```

---

## Implementing Django View with Database Query
DESCRIPTION: Creates an index view that queries the database for the latest 5 questions and returns them as a comma-separated string in an HTTP response.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial03.txt#2025-04-23_snippet_2
LANGUAGE: python
```python
from django.http import HttpResponse

from .models import Question


def index(request):
    latest_question_list = Question.objects.order_by("-pub_date")[:5]
    output = ", ".join([q.question_text for q in latest_question_list])
    return HttpResponse(output)
```

---

## Including App URLs in Django Project URLconf
DESCRIPTION: Demonstrates how to include an app's URLs in the main project URLconf.
SOURCE: https://github.com/django/django/blob/main/docs/ref/templates/builtins.txt#2025-04-23_snippet_46
LANGUAGE: python
```python
path("clients/", include("project_name.app_name.urls"))
```

---

## Creating SQL Tables for Django Models
DESCRIPTION: This SQL snippet shows the creation of database tables for Django models, including foreign key constraints and indexes. It demonstrates how Django translates model definitions into database-specific SQL statements.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial02.txt#2025-04-23_snippet_3
LANGUAGE: sql
```sql
"choice_text" varchar(200) NOT NULL,
"votes" integer NOT NULL,
"question_id" bigint NOT NULL
);
ALTER TABLE "polls_choice"
  ADD CONSTRAINT "polls_choice_question_id_c5b4b260_fk_polls_question_id"
    FOREIGN KEY ("question_id")
    REFERENCES "polls_question" ("id")
    DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "polls_choice_question_id_c5b4b260" ON "polls_choice" ("question_id");

COMMIT;
```

---

## Managing Index Naming in Meta Classes with Django ORM (Python)
DESCRIPTION: Illustrates how to avoid index name collisions in abstract base classes by using placeholders in the index name. This leverages 'app_label' and 'class' substitutions within the string, ensuring that unique names are generated for subclasses. The key input is a string with substitution placeholders, and the output is a per-model index name. Required dependencies: Django model Meta options and valid field names.
SOURCE: https://github.com/django/django/blob/main/docs/ref/models/indexes.txt#2025-04-23_snippet_2
LANGUAGE: Python
```python
Index(fields=['title'], name='%(app_label)s_%(class)s_title_index')
```

---

## Defining Application Namespace in Django App URLconf
DESCRIPTION: This snippet shows how to define an application namespace in a Django app's URLconf. It sets the app_name variable and defines URL patterns for the application views.
SOURCE: https://github.com/django/django/blob/main/docs/topics/http/urls.txt#2025-04-23_snippet_13
LANGUAGE: python
```python
from django.urls import path

from . import views

app_name = "polls"
urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path("<int:pk>/", views.DetailView.as_view(), name="detail"),
    ...,
]
```

---

## Configuring Django Template Backends
DESCRIPTION: Example configuration for the TEMPLATES setting in Django, showing how to set up multiple template backends with different directories and options.
SOURCE: https://github.com/django/django/blob/main/docs/topics/templates.txt#2025-04-23_snippet_5
LANGUAGE: python
```python
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            "/home/html/example.com",
            "/home/html/default",
        ],
    },
    {
        "BACKEND": "django.template.backends.jinja2.Jinja2",
        "DIRS": [
            "/home/html/jinja2",
        ],
    },
]
```

---

## Configuring Django Template Settings for App-Level Overrides
DESCRIPTION: This snippet demonstrates how to configure Django settings to enable template overriding from an app's template directory. The key setting is APP_DIRS set to True, which tells Django to look for templates within app directories.
SOURCE: https://github.com/django/django/blob/main/docs/howto/overriding-templates.txt#2025-04-23_snippet_1
LANGUAGE: python
```python
TEMPLATES = [
    {
        # ...
        "APP_DIRS": True,
        # ...
    },
]
```

---

## Configuring Feed URLs with Patterns in Django URLconf - Python
DESCRIPTION: Demonstrates use of the "patterns" function in Django URLconf to define routes for feeds using both the legacy "feed" view and the new Feed class approach. Shows inclusion of parameters in URL regex patterns, providing routing context for dynamic feed generation. This requires Django settings, functional endpoints or Feed class instantiations, and appropriate import of pattern helpers. Expects URL patterns as input and returns a tuple or other routing object usable by Django's URL resolver.
SOURCE: https://github.com/django/django/blob/main/docs/releases/1.2.txt#2025-04-23_snippet_25
LANGUAGE: python
```python
(
    r"^feeds/(?P<url>.*)/$",
    "django.contrib.syndication.views.feed",
    {"feed_dict": feeds},
)
```
LANGUAGE: python
```python
from django.conf.urls.defaults import *
from myproject.feeds import LatestEntries, LatestEntriesByCategory

urlpatterns = patterns(
    "",
    # ...
    (r"^feeds/latest/$", LatestEntries()),
    (r"^feeds/categories/(?P<category_id>\\d+)/$", LatestEntriesByCategory()),
    # ...
)
```

---

## Implementing Question Detail View with 404 Handling
DESCRIPTION: Creates a view function that displays details for a specific question, implementing error handling for non-existent questions using Http404 exception.
SOURCE: https://github.com/django/django/blob/main/docs/intro/tutorial03.txt#2025-04-23_snippet_6
LANGUAGE: python
```python
from django.http import Http404
from django.shortcuts import render

from .models import Question


# ...
def detail(request, question_id):
    try:
        question = Question.objects.get(pk=question_id)
    except Question.DoesNotExist:
        raise Http404("Question does not exist")
    return render(request, "polls/detail.html", {"question": question})
```

---

## Project Layout with Top-Level App Directory (Text)
DESCRIPTION: Shows an alternative Django project structure where an application (`myapp`) is placed adjacent to `manage.py` and outside the main project package (`mysite`). This allows the app to be imported as a top-level module (e.g., `import myapp`) rather than using the project prefix.
SOURCE: https://github.com/django/django/blob/main/docs/releases/1.4.txt#2025-04-23_snippet_2
LANGUAGE: text
```text
manage.py
myapp/
    __init__.py
    models.py
mysite/
    __init__.py
    settings.py
    urls.py
```

---

## Adding a Custom Manager to a Django Model (Python)
DESCRIPTION: This snippet shows how to declare a custom manager by adding a Manager instance with a user-defined name (here, 'people') to a Django model. By explicitly assigning a custom manager on the model class, the default 'objects' manager will not appear. Dependencies include Django framework and a valid project setup. Input: none directly, but you must use this class in a Django app. Output: the model will have 'people' as the manager for query operations.
SOURCE: https://github.com/django/django/blob/main/docs/ref/models/class.txt#2025-04-23_snippet_0
LANGUAGE: python
```python
from django.db import models


class Person(models.Model):
    # Add manager with another name
    people = models.Manager()