# Project Plan: E-Mail Automation Service (EAS)

## 1. Project Goals

1.  **User Interface (UI):** Develop an intuitive web interface using React + TypeScript + Vite. The UI should be **stylish, colorful, highly animated, and visually distinct**, achieved through unique component design, custom animations (using Framer Motion), and a well-defined color palette, providing a pleasant user experience that stands out. Utilize Tailwind CSS for styling.
2.  **Authentication:** Implement user registration and login via Google OAuth 2.0.
3.  **Task Configuration:** Enable users to define tasks, specifying not just initial prompts but also the **desired text output characteristics**. This includes providing constraints, examples of desired tone/style, key information to include/exclude, and potentially evaluation criteria for the AI's refinement loop. Users will select AI models (OpenAI, Gemini, Anthropic) and provide detailed instructions/parameters.
4.  **Scheduling:** Allow users to create flexible schedules (e.g., recurring, one-off) for task execution.
5.  **AI Integration (Agentic):** Build a robust module using LangGraph to create an agent that:
    *   Handles the generation of user-specified text based on the detailed configuration.
    *   Interacts with selected AI provider APIs (OpenAI, Gemini, Anthropic).
    *   Employs a **multi-iteration refinement process** (e.g., generate -> critique via LLM/rules -> refine) to improve the generated text against user requirements before finalization.
6.  **Email Delivery (User-Selectable Provider):** Integrate with multiple email services (SendGrid, Mailgun, AWS SES, Gmail via OAuth 2.0, standard SMTP) allowing user selection, configuration, and secure credential storage.
7.  **Task Scheduling Backend:** Implement a reliable system (Celery with Redis/RabbitMQ) to trigger the LangGraph agent and email sending based on user schedules.
8.  **Secure Data Storage (PostgreSQL):** Persist user data, configurations, schedules, and encrypted credentials/tokens securely.
9.  **Extensibility:** Design core modules (AI, Email) with abstractions to facilitate future addition of task types, AI models, or email providers.

## 2. Proposed Architecture

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

## 3. Technology Stack

*   **Frontend:** React + TypeScript + Vite.
    *   *UI Styling:* Tailwind CSS (highly customized).
    *   *Animation:* Framer Motion.
*   **Backend API:** Python with Django.
*   **Database:** PostgreSQL.
*   **Task Scheduler:** Celery.
*   **Message Broker:** Redis (for Celery).
*   **Authentication:** Backend OAuth library (e.g., `django-allauth`), Google API Client Library.
*   **AI Integration:** LangChain for tools and integrations, LangGraph for orchestration, LangSmith for logging and tracing LLM calls, Official LLM SDKs (OpenAI, Google, Anthropic).
*   **Email:** Abstraction layer, Provider SDKs (SendGrid, Mailgun, AWS), Google API Client Library (for Gmail OAuth).
*   **Containerization:** Docker & Docker Compose.
*   **Documentation Retrieval:** Context7 MCP, Existing `AI-Docs/` folder.

## 4. Security Considerations

*   **Authentication & Authorization:** Robust implementation using Google OAuth 2.0. Secure handling and storage of OAuth tokens (refresh tokens encrypted at rest). Role-based access control if needed in the future.
*   **Credential Management:** All external API keys (LLMs, Email Providers) and user-provided SMTP/Email credentials must be encrypted at rest (e.g., using Django's encrypted fields or a dedicated secrets manager like HashiCorp Vault). Secure retrieval mechanisms for use by backend services. Never expose secrets in frontend code.
*   **Data Encryption:** Encrypt sensitive user data in the database (e.g., email provider credentials, potentially parts of task configurations). Use HTTPS for all communication (encryption in transit).
*   **Input Validation:** Implement strict input validation on all API endpoints to prevent injection attacks (SQLi, XSS). Sanitize any user-generated content used in emails.
*   **Dependency Management:** Regularly scan dependencies (Python, Node.js) for known vulnerabilities using tools like `safety` (Python) and `npm audit` or Snyk.
*   **Rate Limiting & Throttling:** Implement rate limiting on API endpoints to prevent abuse.
*   **CSRF Protection:** Utilize Django's built-in CSRF protection.
*   **Security Headers:** Implement appropriate security headers (e.g., CSP, HSTS, X-Frame-Options).

## 5. Error Handling & Monitoring

*   **Structured Logging:** Implement comprehensive logging across all components (API, Celery workers, LangGraph agent) using a structured format (e.g., JSON). Include correlation IDs to trace requests across services.
*   **Error Reporting:** Integrate an error tracking service (e.g., Sentry, Rollbar) to capture and aggregate exceptions from the backend and potentially the frontend.
*   **Task Failure Handling:** Implement robust error handling within Celery tasks. Define retry strategies (e.g., exponential backoff) for transient errors (network issues, temporary API unavailability). Implement dead-letter queues for tasks that fail repeatedly. Provide visibility into failed tasks for users/admins.
*   **API Error Handling:** Gracefully handle errors from external APIs (LLMs, Email providers), providing informative feedback to the user or logging appropriately.
*   **Health Checks:** Implement health check endpoints for the API server and potentially Celery workers for monitoring systems.
*   **Monitoring:** Set up basic monitoring for resource utilization (CPU, memory, disk), database performance, and message queue depth (Redis). Consider tools like Prometheus/Grafana or cloud provider monitoring.

## 6. Operational Considerations

*   **API Cost Management:** Implement mechanisms to track usage of external LLM and email APIs per user or task. Consider setting usage quotas or providing cost estimates to users.
*   **Rate Limit Management:** Be aware of and handle rate limits imposed by external APIs. Implement strategies like caching, queuing, or backoff to stay within limits.
*   **Scalability:** While initial focus is on functionality, design with basic scalability in mind (e.g., stateless API servers, potentially scaling Celery workers).
*   **Data Backups:** Implement regular automated backups for the PostgreSQL database.

## 7. Deployment Strategy

*   **Environment Parity:** Use Docker Compose (`docker-compose.yml`) for local development to ensure consistency with production.
*   **Containerization:** Package the frontend (static build), backend API, and Celery workers into Docker images.
*   **CI/CD Pipeline:** Set up a CI/CD pipeline (e.g., GitHub Actions, GitLab CI, Jenkins) to automate:
    *   Linting and code analysis.
    *   Running unit and integration tests.
    *   Building Docker images.
    *   Pushing images to a container registry (e.g., Docker Hub, AWS ECR, Google GCR).
    *   Deploying updated images to the hosting environment.
*   **Hosting Environment:** Initially focus on local Docker Compose deployment. Plan for future cloud deployment (e.g., AWS ECS/EKS, Google Cloud Run/GKE, Heroku, DigitalOcean App Platform) requiring managed PostgreSQL and Redis.
*   **Configuration Management:** Manage environment-specific configurations (database URLs, API keys, etc.) securely, separate from code (e.g., environment variables, secrets management services).
*   **Database Migrations:** Integrate database schema migrations (Django migrations) into the deployment process.

## 8. Development Plan Outline

**Note:** The execution of these phases will be managed using the **Orchestrator mode**. Each phase will be broken down into smaller, actionable subtasks, potentially delegated to specialized modes (e.g., Code, Debug) as needed. Progress will be tracked in `PROGRESS.md`.

0.  **Phase 0: Documentation Gathering & Initial Setup**
    *   **Goal:** Review existing documentation, gather remaining essential documentation for key technologies using Context7 MCP, and perform initial project setup.
    *   **Tasks:**
        *   Review existing documentation in `AI-Docs/`:
            *   `AI-Docs/celery_docs.md`
            *   `AI-Docs/django_docs.md`
            *   `AI-Docs/langgraph_docs.md`
            *   `AI-Docs/react_docs.md`
        *   Use Context7 to retrieve documentation for *remaining* key technologies:
            *   TypeScript (general concepts, integration with React)
            *   Vite (configuration, development server)
            *   Tailwind CSS (setup with React/Vite, customization)
            *   Framer Motion (integration with React, core concepts)
            *   Redis (basic usage, integration with Celery)
            *   LangChain (core concepts, relevant tools/integrations)
            *   Google OAuth 2.0 (Client Libraries for Python/JS, flow details)
            *   Selected Email Provider SDKs (SendGrid, Mailgun, AWS SES, Gmail API)
            *   PostgreSQL (basic SQL, interaction via Django ORM)
            *   Docker & Docker Compose (Dockerfile best practices, compose file structure)
        *   Store retrieved documentation snippets/links in `AI-Docs/`.
        *   Initialize Git repository.
        *   Create `PROGRESS.md` file.
        *   Set up basic project directory structure.

1.  **Phase 1: Foundation & Authentication**
    *   **Goal:** Set up project structure, Docker, DB, basic API, and Google OAuth.
    *   **Tasks:**
        *   Initialize Django backend, set up `docker-compose.yml` (backend, PostgreSQL, Redis).
        *   Initialize React+TS+Vite frontend, add Dockerfile, add to `docker-compose.yml`.
        *   Define PostgreSQL schemas using Django ORM: `Users` (incl. Google ID, OAuth tokens), `TaskConfigs`, `Schedules`, `Credentials` (for email providers, encrypted).
        *   Implement initial migrations.
        *   Implement Google OAuth 2.0 flow (frontend and backend using `django-allauth` or similar) for user registration/login.
        *   Implement secure storage/retrieval for external API keys and OAuth refresh tokens (using encryption or secrets manager).
        *   Set up basic Celery configuration and a simple test task.
        *   Set up basic structured logging.
        *   *Update `PROGRESS.md`*.

2.  **Phase 2: Core Task Config & Scheduling Logic**
    *   **Goal:** Implement CRUD for task configurations and schedules, link to Celery.
    *   **Tasks:**
        *   Create API endpoints (Django Rest Framework) for CRUD operations on `TaskConfigs` and `Schedules`. Implement necessary validation.
        *   Implement basic UI components (React/Tailwind) for listing, creating, and editing these configurations (functionality first, high fidelity later).
        *   Implement API logic to add/update/remove scheduled jobs in Celery based on user `Schedules`. Define the Celery task structure that will eventually run the agent.
        *   *Update `PROGRESS.md`*.

3.  **Phase 3: Frontend Implementation (High Fidelity)**
    *   **Goal:** Build the standout user interface using Tailwind and Framer Motion.
    *   **Tasks:**
        *   Implement all UI components for managing tasks, schedules, user settings, email provider configuration using Tailwind CSS.
        *   Focus heavily on achieving the specified high-quality visual style: Implement custom styling, transitions, and animations using Framer Motion.
        *   Ensure seamless integration between frontend components and backend API endpoints.
        *   Implement frontend handling for Google OAuth flow.
        *   *Update `PROGRESS.md`*.

4.  **Phase 4: LangGraph Agent (Advanced)**
    *   **Goal:** Develop the sophisticated, refining text generation agent.
    *   **Tasks:**
        *   Design the detailed flow for the LangGraph agent, including states for generation, critique, refinement, and finalization.
        *   Implement the agent logic using LangGraph, including interaction with different LLM APIs based on `TaskConfig`.
        *   Implement the critique mechanism (e.g., using a separate LLM call with specific instructions, applying rule-based checks based on user constraints).
        *   Implement the refinement step, feeding critique back into the generation process.
        *   Integrate agent execution into the Celery task defined in Phase 2. Ensure task parameters (`TaskConfig` ID) are passed correctly.
        *   Add detailed logging within the agent's execution flow (consider LangSmith integration).
        *   *Update `PROGRESS.md`*.

5.  **Phase 5: Email Module & Provider Integration**
    *   **Goal:** Implement flexible, user-configurable email sending.
    *   **Tasks:**
        *   Develop the abstract `Email_Module` interface/base class in Python.
        *   Implement provider-specific classes inheriting from the base: SendGrid, Mailgun, SES, standard SMTP. Ensure secure handling of credentials passed to these classes.
        *   Implement the Gmail OAuth sending class: Utilize stored user OAuth tokens (requesting `gmail.send` scope during auth) to send via the Gmail API. Implement logic for token refresh if necessary.
        *   Update the main Celery task: After the LangGraph agent successfully generates content, retrieve the appropriate email provider configuration based on user settings and use the `Email_Module` to send the email.
        *   Implement API endpoints and UI components for users to select their desired email provider, enter/manage credentials securely (including initiating the OAuth flow for Gmail if not already done), and test their configuration.
        *   *Update `PROGRESS.md`*.

6.  **Phase 6: Testing, Refinement & Deployment Prep**
    *   **Goal:** Ensure reliability, security, and prepare for initial deployment.
    *   **Tasks:**
        *   Write unit tests for critical backend logic (Django views/serializers, agent core logic, email module abstractions/implementations, Celery task logic).
        *   Write integration tests for key flows (API endpoint interactions, API-Celery communication, Agent-Email integration).
        *   Conduct end-to-end testing covering major user journeys: Google OAuth login -> Task Creation -> Scheduling -> Agent Execution -> Email Delivery (test with multiple providers).
        *   Perform security testing/review (check for OWASP Top 10 vulnerabilities, review credential handling).
        *   Refine UI/UX based on testing and feedback.
        *   Finalize Docker configurations for production.
        *   Write basic user documentation/README.
        *   Prepare initial CI/CD pipeline configuration.
        *   *Update `PROGRESS.md`*.

## 9. Project Tracking

*   A `PROGRESS.md` file will be maintained at the root of the project.
*   This file will serve as a high-level log of project progress, key decisions, phase completions, and any significant changes or roadblocks encountered.
*   The Orchestrator mode (or the relevant mode performing the work) will be responsible for updating this file after completing major tasks or phases outlined in the Development Plan.