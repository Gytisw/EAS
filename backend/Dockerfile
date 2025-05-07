# backend/Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user and switch to it (good practice)
RUN addgroup --system app && adduser --system --group app
# USER app # Temporarily comment out USER app for initial setup ease, can be re-enabled.
           # manage.py startproject might have permission issues if run as non-root initially without proper setup.

COPY . /app/

EXPOSE 8000

# Default command for development
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]