# Comprehensive Docker Compose Example for Full Stack Application

This document provides a more detailed `docker-compose.yml` structure and explanation for orchestrating a full-stack application consisting of a Django backend, React/Vite frontend, PostgreSQL database, Redis cache/broker, and Celery workers. This builds upon the general Docker best practices.

## Core `docker-compose.yml` Structure

```yaml
# docker-compose.yml

services:
  # --- Database Service (PostgreSQL) ---
  db:
    image: postgres:17.4-alpine # As per TECH_STACK.md
    container_name: eas_db
    volumes:
      - postgres_data:/var/lib/postgresql/data/ # Named volume for persistence
    environment:
      POSTGRES_USER: ${SQL_USER} # From .env file
      POSTGRES_PASSWORD: ${SQL_PASSWORD} # From .env file
      POSTGRES_DB: ${SQL_DATABASE} # From .env file
    ports:
      - "5432:5432" # Expose only if direct host access is needed for debugging

  # --- Cache/Broker Service (Redis) ---
  redis:
    image: redis:8.0.0-alpine # As per TECH_STACK.md
    container_name: eas_redis
    ports:
      - "6379:6379" # Expose only if direct host access is needed for debugging

  # --- Backend Service (Django) ---
  backend:
    build:
      context: ./backend # Assuming backend Dockerfile is in ./backend/
      dockerfile: Dockerfile # Or Dockerfile.dev / Dockerfile.prod
    container_name: eas_backend
    command: python manage.py runserver 0.0.0.0:8000 # Development server
    # For production, consider:
    # command: gunicorn your_project_name.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - ./backend:/app # Mount backend code for hot-reloading in development
    ports:
      - "8000:8000"
    environment:
      # General
      - DEBUG=1 # Set to 0 in production
      - PYTHONUNBUFFERED=1
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY} # From .env file
      # Database
      - SQL_ENGINE=django.db.backends.postgresql
      - SQL_DATABASE=${SQL_DATABASE}
      - SQL_USER=${SQL_USER}
      - SQL_PASSWORD=${SQL_PASSWORD}
      - SQL_HOST=db # Service name of the PostgreSQL container
      - SQL_PORT=5432
      # Celery
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/1
      # Other API keys / settings from .env
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    depends_on:
      - db
      - redis
    env_file:
      - ./.env # Load environment variables from .env file in project root

  # --- Frontend Service (React/Vite) ---
  frontend:
    build:
      context: ./frontend # Assuming frontend Dockerfile is in ./frontend/
      dockerfile: Dockerfile # Or Dockerfile.dev / Dockerfile.prod
    container_name: eas_frontend
    volumes:
      # Mount frontend code for hot-reloading in development
      - ./frontend:/app
      # Persist node_modules in a volume to avoid reinstalling on every code change
      # if node_modules is not copied in Dockerfile's final stage for dev.
      # Alternatively, ensure node_modules is part of the image and don't mount over it.
      - /app/node_modules # Anonymous volume to persist node_modules if not in image
    ports:
      - "5173:5173" # Default Vite development port
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true # May be needed for HMR in some Docker setups
      - VITE_API_BASE_URL=http://localhost:8000 # For frontend to call backend (adjust if using nginx)
      # Or if directly calling the backend service:
      # - VITE_API_BASE_URL=http://backend:8000
    depends_on:
      - backend # If frontend needs backend during its build or for API calls

  # --- Celery Worker Service ---
  worker:
    build:
      context: ./backend # Often shares the same image as the backend
      dockerfile: Dockerfile
    container_name: eas_worker
    command: celery -A your_project_name.celery worker -l info # Replace your_project_name
    volumes:
      - ./backend:/app # Mount backend code
    environment:
      # Inherit or redefine necessary environment variables
      - DEBUG=1
      - PYTHONUNBUFFERED=1
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
      - SQL_ENGINE=django.db.backends.postgresql
      - SQL_DATABASE=${SQL_DATABASE}
      - SQL_USER=${SQL_USER}
      - SQL_PASSWORD=${SQL_PASSWORD}
      - SQL_HOST=db
      - SQL_PORT=5432
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/1
    depends_on:
      - redis
      - db # If tasks directly interact with the database
    env_file:
      - ./.env

# --- Named Volumes Definition ---
volumes:
  postgres_data: # Persists PostgreSQL data
  # frontend_node_modules: # Example if using a named volume for node_modules

# --- Networks (Optional - Compose creates a default bridge network) ---
# networks:
#   eas_network:
#     driver: bridge
```

## Explanation and Best Practices

*   **`version: '3.8'`**: Specifies the Docker Compose file format version.
*   **`services`**: Each service defines a container.
    *   **`db` (PostgreSQL)**:
        *   Uses the official `postgres:17.4-alpine` image.
        *   `volumes: - postgres_data:/var/lib/postgresql/data/`: Persists database data in a named volume `postgres_data`. This is crucial to prevent data loss when the container stops or is removed.
        *   `environment`: Sets PostgreSQL credentials and database name, ideally loaded from an `.env` file.
    *   **`redis` (Redis)**:
        *   Uses the official `redis:8.0.0-alpine` image.
    *   **`backend` (Django)**:
        *   `build: context: ./backend`: Builds an image using the `Dockerfile` located in the `./backend` directory.
        *   `command`: Specifies the command to run (e.g., Django development server). For production, this would typically be a Gunicorn or Uvicorn command.
        *   `volumes: - ./backend:/app`: Mounts the host's `./backend` directory into the container's `/app` directory. This allows for hot-reloading of code changes during development.
        *   `ports: - "8000:8000"`: Maps port 8000 on the host to port 8000 in the container.
        *   `environment`: Sets environment variables. Sensitive values like `DJANGO_SECRET_KEY` and database credentials should be loaded from an `.env` file. Service names (`db`, `redis`) are used as hostnames for inter-container communication.
        *   `depends_on`: Ensures `db` and `redis` services are started before the `backend` service. Note: This doesn't guarantee readiness, only startup order.
        *   `env_file: - ./.env`: Tells Docker Compose to load environment variables from an `.env` file in the project root.
    *   **`frontend` (React/Vite)**:
        *   `build: context: ./frontend`: Builds from `./frontend/Dockerfile`.
        *   `volumes`: Mounts host code for HMR. The `- /app/node_modules` is an anonymous volume trick to prevent the host's (potentially empty or OS-specific) `node_modules` from overwriting the one installed in the Docker image during the build.
        *   `ports: - "5173:5173"`: Maps Vite's default dev server port.
        *   `environment: CHOKIDAR_USEPOLLING=true`: Can help with HMR reliability in some Docker environments. `VITE_API_BASE_URL` tells the frontend where the backend API is.
    *   **`worker` (Celery)**:
        *   Often uses the same build context/image as the `backend` because it needs access to the same Django project code and settings.
        *   `command`: Starts the Celery worker, pointing to the Celery app instance (e.g., `your_project_name.celery`).
        *   `depends_on`: Ensures `redis` (broker) and `db` (if tasks use the DB) are started first.
*   **`volumes` (Top-Level)**:
    *   `postgres_data:`: Defines the named volume used by the `db` service for data persistence.
*   **`.env` File (Example - place in project root, add to `.gitignore`)**:
    ```env
    # .env
    DEBUG=1
    DJANGO_SECRET_KEY=your_very_secret_django_key_here
    SQL_DATABASE=eas_db
    SQL_USER=eas_user
    SQL_PASSWORD=eas_password
    # Add other secrets like SENDGRID_API_KEY, etc.
    ```
*   **Networking**: Docker Compose automatically creates a default bridge network for all services defined in the file. Services can reach each other using their service names as hostnames (e.g., the backend can connect to PostgreSQL at `db:5432`).

## Basic Dockerfile Examples (Conceptual)

**`./backend/Dockerfile` (Django)**
```dockerfile
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"] # For dev
# For prod, CMD might be ["gunicorn", "your_project_name.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**`./frontend/Dockerfile` (React/Vite - Dev Focus)**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install # Or yarn install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"] # Runs Vite dev server, accessible externally
```
*(For a production frontend Dockerfile, you'd typically have a multi-stage build to create static assets and serve them with a web server like Nginx.)*

This comprehensive example should provide a solid foundation for the `docker-compose.yml` setup required in Phase 1.