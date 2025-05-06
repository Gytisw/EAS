# Docker & Docker Compose Setup Summary

## Dockerfile Best Practices

*   **Use Official Base Images:** Start with official images (e.g., `python:3.12-slim`, `node:20-alpine`) whenever possible. Choose slim/alpine variants for smaller image sizes.
*   **Minimize Layers:** Each instruction in a Dockerfile creates a layer. Combine related commands using `&&` (e.g., `apt-get update && apt-get install -y ...`).
*   **Layer Caching:** Order instructions from least frequently changing to most frequently changing. Copy dependency manifests (`requirements.txt`, `package.json`) and install dependencies *before* copying application code to leverage Docker's build cache.
*   **Use `.dockerignore`:** Exclude unnecessary files and directories (e.g., `.git`, `node_modules`, `__pycache__`, virtual environments, local secrets) from the build context to speed up builds and reduce image size.
*   **Non-Root User:** Run applications as a non-root user for better security (`USER appuser`). Create the user and group first.
*   **Specify `WORKDIR`:** Set the working directory for subsequent commands (`WORKDIR /app`).
*   **Expose Ports:** Declare the ports your application listens on (`EXPOSE 8000`). This is mainly for documentation; ports need to be mapped in Docker Compose or `docker run`.
*   **`CMD` vs `ENTRYPOINT`:**
    *   `CMD`: Provides default arguments for an executing container. Can be easily overridden when running the container. Use for the main application command (e.g., `CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]`).
    *   `ENTRYPOINT`: Configures a container that will run as an executable. Less easily overridden. Often used with `CMD` to provide default parameters to the entrypoint script.
*   **Multi-Stage Builds:** Use multi-stage builds to separate build-time dependencies from runtime dependencies, resulting in smaller final images (e.g., build frontend static assets in a `node` stage, then copy them into a final `nginx` or Python stage).

**Example Python/Django Dockerfile:**
```dockerfile
# Use official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1 # Prevents Python from writing pyc files
ENV PYTHONUNBUFFERED 1       # Prevents Python from buffering stdout/stderr

# Set work directory
WORKDIR /app

# Install system dependencies if needed (example)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc postgresql-client && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user and switch to it
RUN addgroup --system app && adduser --system --group app
USER app

# Copy project code
COPY . /app/

# Expose port (adjust if your app uses a different port)
EXPOSE 8000

# Default command to run the application (adjust as needed)
# For development:
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
# For production (using Gunicorn example):
# CMD ["gunicorn", "your_project.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**Example Node.js/React/Vite Dockerfile (Multi-Stage):**
```dockerfile
# ---- Build Stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package.json yarn.lock ./
# Or: COPY package.json package-lock.json ./

# Install dependencies
RUN yarn install --frozen-lockfile
# Or: RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build
# Or: RUN npm run build

# ---- Production Stage ----
# Use a lightweight web server image like nginx
FROM nginx:stable-alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Default command to start nginx
CMD ["nginx", "-g", "daemon off;"]
```

## Docker Compose File Structure (`docker-compose.yml`)

Defines and runs multi-container Docker applications.

*   **`services`:** Defines the containers that make up your application. Each key is a service name (e.g., `web`, `db`, `redis`, `worker`).
    *   **`build`:** Specifies the build context (path to directory containing Dockerfile) or detailed build options.
        ```yaml
        services:
          web:
            build: . # Build using Dockerfile in the current directory
          # Or with context and Dockerfile specified:
          # backend:
          #   build:
          #     context: ./backend
          #     dockerfile: Dockerfile.prod
        ```
    *   **`image`:** Specifies the image to start the container from (e.g., `postgres:17-alpine`, `redis:8-alpine`). Used if `build` is not present.
    *   **`container_name`:** Assigns a custom name to the container (optional).
    *   **`ports`:** Maps host ports to container ports (`HOST:CONTAINER`).
        ```yaml
        ports:
          - "8000:8000" # Map host port 8000 to container port 8000
        ```
    *   **`volumes`:** Mounts host paths or named volumes into the container (`HOST/NAMED_VOLUME:CONTAINER_PATH`). Use named volumes for persistent data (like databases). Use host mounts for code during development.
        ```yaml
        volumes:
          # Mount current directory code into /app (for development)
          - .:/app
          # Use a named volume for PostgreSQL data persistence
          - postgres_data:/var/lib/postgresql/data
        ```
    *   **`environment`:** Sets environment variables inside the container. Can use a list or map, or reference an external `.env` file.
        ```yaml
        environment:
          - DEBUG=1
          - DATABASE_URL=postgresql://user:password@db:5432/dbname
          - SECRET_KEY=${DJANGO_SECRET_KEY} # Reads from .env file or host env
        # Or using env_file:
        # env_file:
        #   - .env.db
        #   - .env.web
        ```
    *   **`depends_on`:** Defines service dependencies. Controls startup order (service B starts after service A) but doesn't guarantee service A is *ready*. Use healthchecks or wait scripts for readiness.
        ```yaml
        services:
          web:
            build: .
            depends_on:
              - db
              - redis
          worker:
            build: .
            command: celery -A your_project worker -l info
            depends_on:
              - redis
          db:
            image: postgres:17-alpine
          redis:
            image: redis:8-alpine
        ```
    *   **`command`:** Overrides the default command specified by the image's Dockerfile (`CMD`).
    *   **`networks`:** Connects services to specific networks (optional, Compose creates a default network).
*   **`volumes`:** Defines named volumes for data persistence outside the container lifecycle.
    ```yaml
    volumes:
      postgres_data: # Define the named volume used by the db service
    ```
*   **`networks`:** Defines custom networks (optional).

**Example `docker-compose.yml` for Django/React/Celery/Redis/Postgres:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:17.4-alpine # Use specific version from TECH_STACK.md
    container_name: eas_db
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_DB=${SQL_DATABASE}
      - POSTGRES_USER=${SQL_USER}
      - POSTGRES_PASSWORD=${SQL_PASSWORD}
    ports:
      - "5432:5432" # Expose for local connections if needed

  redis:
    image: redis:8.0.0-alpine # Use specific version from TECH_STACK.md
    container_name: eas_redis
    ports:
      - "6379:6379" # Expose for local connections if needed

  backend:
    build:
      context: . # Assuming Dockerfile is in the root for backend
      # dockerfile: Dockerfile.backend # If named differently
    container_name: eas_backend
    command: python manage.py runserver 0.0.0.0:8000 # Dev command
    volumes:
      - .:/app # Mount code for development
    ports:
      - "8000:8000"
    environment:
      - DEBUG=1
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
      - SQL_ENGINE=django.db.backends.postgresql
      - SQL_DATABASE=${SQL_DATABASE}
      - SQL_USER=${SQL_USER}
      - SQL_PASSWORD=${SQL_PASSWORD}
      - SQL_HOST=db # Service name of the database container
      - SQL_PORT=5432
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/1
      # Add other env vars (API keys, etc.)
    depends_on:
      - db
      - redis
    # env_file:
    #   - .env # Load variables from .env file

  frontend:
    build:
      context: ./frontend # Assuming frontend code is in ./frontend
      # dockerfile: frontend/Dockerfile # If named differently
    container_name: eas_frontend
    volumes:
      - ./frontend:/app # Mount code for development HMR
      - /app/node_modules # Don't mount host node_modules over container's
    ports:
      - "5173:5173" # Default Vite dev port
    environment:
      - NODE_ENV=development
      # Add VITE_API_URL=http://backend:8000 if needed
    depends_on:
      - backend # Optional, depending on API calls during build/dev

  worker:
    build:
      context: . # Uses the same build context as backend
    container_name: eas_worker
    command: celery -A your_project_name worker -l info # Replace your_project_name
    volumes:
      - .:/app
    environment:
      # Inherit necessary env vars from backend or define here/in .env
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
      - db # If worker needs DB access directly
    # env_file:
    #   - .env

volumes:
  postgres_data: # Define named volume for db persistence

# networks: # Optional custom network definition
#   eas_network:
#     driver: bridge
```

## Key Concepts & Links

*   **Dockerfile:** Blueprint for building a single container image.
*   **Docker Compose:** Tool for defining and running multi-container applications.
*   **Services:** Individual containers defined in `docker-compose.yml`.
*   **Volumes:** Mechanism for persisting data or mounting code. Named volumes are preferred for data.
*   **Networks:** Compose creates a default network allowing services to communicate using service names as hostnames (e.g., `db`, `redis`).
*   **`.dockerignore`:** Crucial for optimizing build context.
*   **Multi-Stage Builds:** Technique for creating smaller, more secure production images.
*   **Official Docs & Resources:**
    *   [Docker Overview](https://docs.docker.com/get-started/overview/)
    *   [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
    *   [Docker Compose Overview](https://docs.docker.com/compose/)
    *   [Compose File Reference](https://docs.docker.com/compose/compose-file/)
    *   [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
    *   [Dockerizing a Python Django App](https://docs.docker.com/language/python/build-images/) (Official Guide)
    *   [Dockerizing a Node.js App](https://docs.docker.com/language/nodejs/build-images/) (Official Guide)