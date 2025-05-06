# PostgreSQL & Django ORM Summary

## Basic SQL Concepts (PostgreSQL)

*   **`SELECT`:** Retrieve data from a table.
    ```sql
    SELECT column1, column2 FROM your_table WHERE condition;
    SELECT * FROM your_table ORDER BY column1 DESC LIMIT 10;
    ```
*   **`INSERT`:** Add new rows to a table.
    ```sql
    INSERT INTO your_table (column1, column2) VALUES (value1, value2);
    ```
*   **`UPDATE`:** Modify existing rows in a table.
    ```sql
    UPDATE your_table SET column1 = new_value1 WHERE condition;
    ```
*   **`DELETE`:** Remove rows from a table.
    ```sql
    DELETE FROM your_table WHERE condition;
    ```
*   **`CREATE TABLE`:** Define a new table structure (usually handled by Django migrations).
    ```sql
    CREATE TABLE your_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ```
*   **`ALTER TABLE`:** Modify table structure (usually handled by Django migrations).
*   **Joins:** Combine rows from two or more tables based on a related column (e.g., `INNER JOIN`, `LEFT JOIN`). Django ORM handles joins implicitly through relationships.

## Django ORM Interaction

Django's Object-Relational Mapper (ORM) allows you to interact with your PostgreSQL database using Python code instead of raw SQL.

*   **Configuration (`settings.py`):** Define the database connection details.
    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql', # Use PostgreSQL backend
            'NAME': 'your_db_name',
            'USER': 'your_db_user',
            'PASSWORD': 'your_db_password',
            'HOST': 'localhost', # Or your DB host (e.g., 'db' in Docker Compose)
            'PORT': '5432',      # Default PostgreSQL port
        }
    }
    # Requires psycopg2 or psycopg (recommended) installed: pip install psycopg
    ```
*   **Defining Models (`models.py`):** Define database tables as Python classes inheriting from `django.db.models.Model`. Fields are defined as class attributes using Django's field types (`CharField`, `IntegerField`, `DateTimeField`, `ForeignKey`, etc.).
    ```python
    from django.db import models
    from django.contrib.auth.models import User # Example relationship

    class TaskConfig(models.Model):
        name = models.CharField(max_length=200)
        prompt = models.TextField()
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        owner = models.ForeignKey(User, on_delete=models.CASCADE) # Example relationship

        def __str__(self):
            return self.name
    ```
*   **Migrations:** Django's system for evolving your database schema over time.
    *   `python manage.py makemigrations <app_name>`: Creates new migration files based on changes detected in your `models.py`.
    *   `python manage.py migrate`: Applies pending migrations to the database, creating or altering tables.
*   **Basic Querying (Views, Shell, etc.):** Use the model manager (`objects`) to interact with the database.
    *   **Create:** `TaskConfig.objects.create(name='My Task', prompt='...', owner=request.user)`
    *   **Read (Get):** `task = TaskConfig.objects.get(id=1)` (Raises `DoesNotExist` if not found)
    *   **Read (Filter):** `tasks = TaskConfig.objects.filter(owner=request.user)` (Returns a QuerySet)
    *   **Read (All):** `all_tasks = TaskConfig.objects.all()`
    *   **Update:**
        ```python
        task = TaskConfig.objects.get(id=1)
        task.name = 'Updated Name'
        task.save()
        # Or update multiple: TaskConfig.objects.filter(owner=...).update(status='done')
        ```
    *   **Delete:**
        ```python
        task = TaskConfig.objects.get(id=1)
        task.delete()
        # Or delete multiple: TaskConfig.objects.filter(status='old').delete()
        ```
    *   **Relationships:** Access related objects via attributes (e.g., `task.owner.username`). Django handles the SQL JOINs automatically.

## Key Concepts & Links

*   **ORM:** Maps Python objects to database tables.
*   **Models:** Python classes representing database tables.
*   **Fields:** Class attributes representing table columns.
*   **Migrations:** System for managing database schema changes.
*   **QuerySet:** Represents a collection of database objects, allowing chaining of filters and operations. Lazily evaluated.
*   **Manager (`objects`):** Provides methods for database query operations.
*   **Official Docs & Resources:**
    *   [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
    *   [Django Databases Documentation](https://docs.djangoproject.com/en/stable/ref/databases/)
    *   [Django Models Documentation](https://docs.djangoproject.com/en/stable/topics/db/models/)
    *   [Making Queries (Django ORM)](https://docs.djangoproject.com/en/stable/topics/db/queries/)
    *   [Django Migrations](https://docs.djangoproject.com/en/stable/topics/migrations/)