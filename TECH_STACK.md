# Tech Stack: E-Mail Automation Service (EAS)

This document outlines the primary technologies, frameworks, and libraries chosen for the EAS project, along with their specific versions. This ensures consistency, compatibility, and aids in dependency management.

## Frontend

*   **Framework/Library:** React
    *   **Version:** `19.0.0`
    *   **Source:** [GitHub Releases](https://github.com/facebook/react/releases) / [npm](https://www.npmjs.com/package/react)
*   **Language:** TypeScript
    *   **Version:** `5.8.3`
    *   **Source:** [npm](https://www.npmjs.com/package/typescript)
*   **Build Tool:** Vite
    *   **Version:** `6.3.4`
    *   **Source:** [GitHub Releases](https://github.com/vitejs/vite/releases) / [npm](https://www.npmjs.com/package/vite)
*   **UI Styling:** Tailwind CSS
    *   **Version:** `4.1.5`
    *   **Source:** [npm](https://www.npmjs.com/package/tailwindcss)
*   **Animation:** Framer Motion
    *   **Version:** `12.9.4`
    *   **Source:** [npm](https://www.npmjs.com/package/framer-motion)

## Backend

*   **Language:** Python
    *   **Version:** `3.12.x` (Latest stable patch release)
    *   **Source:** [Python.org](https://www.python.org/)
*   **Web Framework:** Django
    *   **Version:** `5.2`
    *   **Source:** [PyPI](https://pypi.org/project/Django/)
*   **Authentication:** `django-allauth` (with `socialaccount`, `openid` extras)
    *   **Version:** `65.7.0`
    *   **Source:** [PyPI](https://pypi.org/project/django-allauth/)
*   **API Framework:** Django Rest Framework
    *   **Version:** `3.16.0`
    *   **Source:** [PyPI](https://pypi.org/project/djangorestframework/)
*   **API Authentication (Django Rest Framework):** `dj-rest-auth`
    *   **Version:** `7.0.1`
    *   **Source:** [PyPI](https://pypi.org/project/dj-rest-auth/)
*   **JWT Support (Django Rest Framework):** `djangorestframework-simplejwt`
    *   **Version:** `5.5.0`
    *   **Source:** [PyPI](https://pypi.org/project/djangorestframework-simplejwt/)
*   **Structured Logging:** `python-json-logger`
    *   **Version:** `3.3.0`
    *   **Source:** [PyPI](https://pypi.org/project/python-json-logger/)
*   **Development Utilities:** `django-extensions`
    *   **Version:** `4.1`
    *   **Source:** [PyPI](https://pypi.org/project/django-extensions/)

## Database

*   **Type:** Relational Database
    *   **System:** PostgreSQL
    *   **Version:** `17.4` (Latest stable)
    *   **Source:** [PostgreSQL.org](https://www.postgresql.org/)
*   **ORM:** Django ORM (Built-in)
*   **Python Client (PostgreSQL):** `psycopg[binary]` (implicitly `psycopg3`)
    *   **Version:** `3.2.7`
    *   **Source:** [PyPI](https://pypi.org/project/psycopg/)

## Task Scheduling & Message Broker

*   **Task Queue:** Celery
    *   **Version:** `5.5`
    *   **Source:** [PyPI](https://pypi.org/project/celery/) / [Docs](https://docs.celeryq.dev/en/stable/)
*   **Message Broker:** Redis
    *   **Version:** `8.0.0` (Latest GA)
    *   **Source:** [GitHub Releases](https://github.com/redis/redis/releases)
*   **Redis Python Client:** `redis`
    *   **Version:** `5.0.7` (pinned in `requirements.txt`)
    *   **Source:** [PyPI](https://pypi.org/project/redis/)
*   **Periodic Task Scheduler (Celery):** `django-celery-beat`
    *   **Version:** `2.8.0`
    *   **Source:** [PyPI](https://pypi.org/project/django-celery-beat/)
*   **Cron Expression Parser:** `croniter`
    *   **Version:** `6.0.0`
    *   **Source:** [PyPI](https://pypi.org/project/croniter/)

## AI Integration

*   **Core Orchestration:** LangChain Core
    *   **Version:** `0.3.58`
    *   **Source:** [GitHub Releases](https://github.com/langchain-ai/langchain/releases)
*   **Main Library:** LangChain
    *   **Version:** `0.3.25`
    *   **Source:** [GitHub Releases](https://github.com/langchain-ai/langchain/releases)
*   **Agent Framework:** LangGraph
    *   **Version:** `0.4.1`
    *   **Source:** [GitHub Releases](https://github.com/langchain-ai/langgraph/releases)
*   **LLM Provider SDKs:** (To be added as needed)
    *   `langchain-openai`: `0.3.16` (Example)
    *   `langchain-google-genai`: Latest stable
    *   `langchain-anthropic`: Latest stable
    *   Official SDKs (OpenAI, Google, Anthropic): Latest stable
*   **Observability:** LangSmith (Optional, for tracing/debugging)
    *   **Version:** Latest stable
    *   **Source:** [PyPI](https://pypi.org/project/langsmith/)

## Email Integration

*   **Abstraction:** Custom Python module
*   **Provider SDKs:** (To be added as needed)
    *   SendGrid: Latest stable (`sendgrid` on PyPI)
    *   Mailgun: Latest stable (`mailgun.py` or official SDK on PyPI)
    *   AWS SES: Latest stable (`boto3` on PyPI)
    *   Gmail API: Latest stable (`google-api-python-client`, `google-auth-oauthlib` on PyPI)
    *   SMTP: Python `smtplib` (Built-in)

## Containerization & Development

*   **Containerization:** Docker & Docker Compose
    *   **Version:** Latest stable installed locally / in CI/CD
*   **Documentation Retrieval:** Context7 MCP, Existing `AI-Docs/` folder

## Security

*   **Dependency Scanning:** `safety` (Python), `npm audit` / Snyk (Node.js)
*   **Secrets Management:** Environment Variables / Platform Secrets Manager (Initial), potentially HashiCorp Vault later.
*   **Field Encryption:** `django-fernet-encrypted-fields`
    *   **Version:** `0.3.0`
    *   **Source:** [PyPI](https://pypi.org/project/django-fernet-encrypted-fields/)
