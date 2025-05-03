# Project Plan: Scheduled AI Text Generator & Emailer

## 1. Project Goals

1.  **User Interface (UI):** Develop an intuitive, **stylish, colorful, highly animated, and visually distinct** web interface using React + TypeScript + Vite, providing a pleasant user experience that stands out.
2.  **Authentication:** Implement user registration and login via Google OAuth 2.0.
3.  **Task Configuration:** Enable users to define tasks, specifying the desired **text output** (not just prompts), selecting AI models (OpenAI, Gemini, Anthropic), and providing detailed instructions/parameters.
4.  **Scheduling:** Allow users to create flexible schedules for task execution.
5.  **AI Integration (Agentic):** Build a robust module using LangGraph to create an agent that:
    *   Handles the generation of **user-specified text** based on configuration.
    *   Interacts with selected AI provider APIs (OpenAI, Gemini, Anthropic).
    *   Employs a **multi-iteration refinement process** to improve the generated text against user requirements before finalization.
6.  **Email Delivery (User-Selectable Provider):** Integrate with multiple email services (SendGrid, Mailgun, AWS SES, Gmail via OAuth 2.0, potentially standard SMTP) allowing user selection and configuration.
7.  **Task Scheduling Backend:** Implement a reliable system (Celery) to trigger the LangGraph agent and email sending.
8.  **Secure Data Storage (PostgreSQL):** Persist user data, configurations, schedules, and encrypted credentials/tokens.
9.  **Extensibility:** Design for future task types, AI models, or email providers.

## 2. Proposed Architecture

```mermaid
graph TD
    subgraph User Facing
        WebApp[Web Application UI (React+TS+Vite - High Fidelity)]
    end

    subgraph Application Backend (Python/Django or Flask)
        APIServer[API Server]
        AuthService[Authentication Service (Google OAuth)]
        TaskScheduler[Task Scheduler (Celery + Redis)]
        Database[(PostgreSQL Database)]
    end

    subgraph Core Services
        AI_Module[AI Integration Module] --> LangGraphAgent[LangGraph Agent (Multi-Iteration Refinement)]
        Email_Module[Abstract Email Sending Module] --> SendGrid_Impl[SendGrid Impl.]
        Email_Module --> Mailgun_Impl[Mailgun Impl.]
        Email_Module --> SES_Impl[AWS SES Impl.]
        Email_Module --> Gmail_OAuth_Impl[Gmail (OAuth) Impl.]
        Email_Module --> SMTP_Impl[SMTP Impl.]
    end

    subgraph External APIs
        Google_OAuth_API[Google OAuth API]
        OpenAI_API[OpenAI API]
        Gemini_API[Gemini API]
        Anthropic_API[Anthropic API]
        SendGrid_API[SendGrid API]
        Mailgun_API[Mailgun API]
        AWS_SES_API[AWS SES API]
        Gmail_API[Gmail API]
    end

    WebApp -- HTTP Requests --> APIServer;
    WebApp -- OAuth Flow --> Google_OAuth_API;
    APIServer -- Validates Token --> Google_OAuth_API;
    APIServer -- User Mgmt --> AuthService;
    AuthService -- CRUD Ops --> Database;
    APIServer -- CRUD Ops --> Database;
    APIServer -- Manage Jobs --> TaskScheduler;
    APIServer -- Uses --> AI_Module;
    APIServer -- Uses --> Email_Module;
    TaskScheduler -- Triggers Job --> APIServer;
    LangGraphAgent -- API Calls --> OpenAI_API;
    LangGraphAgent -- API Calls --> Gemini_API;
    LangGraphAgent -- API Calls --> Anthropic_API;
    SendGrid_Impl -- API Calls --> SendGrid_API;
    Mailgun_Impl -- API Calls --> Mailgun_API;
    SES_Impl -- API Calls --> AWS_SES_API;
    Gmail_OAuth_Impl -- Uses User Token --> Gmail_API;
```

## 3. Technology Stack

*   **Frontend:** React + TypeScript + Vite.
    *   *UI Libraries:* Consider Tailwind CSS (highly customized), Material UI, or Chakra UI.
    *   *Animation:* Consider Framer Motion or GSAP.
*   **Backend API:** Python with Django (Recommended).
*   **Database:** PostgreSQL.
*   **Task Scheduler:** Celery.
*   **Message Broker:** Redis (for Celery).
*   **Authentication:** Backend OAuth library (e.g., `django-allauth`), Google API Client Library.
*   **AI Integration:** LangGraph, Official LLM SDKs (OpenAI, Google, Anthropic).
*   **Email:** Abstraction layer, Provider SDKs (SendGrid, Mailgun, AWS), Google API Client Library (for Gmail OAuth).
*   **Containerization:** Docker & Docker Compose.

## 4. Development Plan Outline

1.  **Phase 1: Foundation & Authentication**
    *   **Goal:** Set up project, DB, Docker, basic API, and Google OAuth.
    *   **Tasks:**
        *   Initialize Python backend (Django/Flask), set up `docker-compose.yml` (backend, PostgreSQL, Redis).
        *   Initialize React+TS+Vite frontend, add Dockerfile, add to `docker-compose.yml`.
        *   Define PostgreSQL schemas: `Users` (incl. Google ID, OAuth tokens), `PromptConfigs` (or `TaskConfigs`), `Schedules`, `Credentials` (for email providers). Use Django ORM or SQLAlchemy.
        *   Implement migrations.
        *   Implement Google OAuth 2.0 flow (frontend and backend) for user registration/login.
        *   Implement secure storage/retrieval for all API keys and OAuth refresh tokens (encryption essential).
        *   Set up Celery.

2.  **Phase 2: Core Task Config & Scheduling Logic**
    *   **Goal:** Implement basic task config, scheduling, and task triggering.
    *   **Tasks:**
        *   Create API endpoints for CRUD on `TaskConfigs` and `Schedules`.
        *   Implement UI components for managing these configurations.
        *   Implement API logic to add/update/remove jobs in Celery based on user schedules.

3.  **Phase 3: Frontend Implementation (High Fidelity)**
    *   **Goal:** Build the standout user interface.
    *   **Tasks:**
        *   Implement all UI components for managing tasks, schedules, settings.
        *   Focus heavily on achieving the specified high-quality visual style: Implement custom styling, transitions, and animations using chosen libraries (e.g., Framer Motion, advanced CSS).
        *   Integrate frontend with backend API.

4.  **Phase 4: LangGraph Agent (Advanced)**
    *   **Goal:** Develop the sophisticated, refining text generation agent.
    *   **Tasks:**
        *   Design and implement the LangGraph agent to handle generalized text generation requests.
        *   Implement the multi-iteration refinement loop within the agent (e.g., generate -> critique -> refine -> critique -> finalize).
        *   Integrate agent execution into a Celery task.

5.  **Phase 5: Email Module & Provider Integration**
    *   **Goal:** Implement flexible email sending.
    *   **Tasks:**
        *   Develop the abstract `Email_Module` interface.
        *   Implement provider-specific classes: SendGrid, Mailgun, SES, SMTP.
        *   Implement the Gmail OAuth sending class: Use stored user OAuth tokens (requesting `gmail.send` scope during auth) to send via the Gmail API. Handle token refresh.
        *   Update the Celery task to use the `Email_Module` after the LangGraph agent generates content, selecting the provider based on user settings.
        *   Implement UI for selecting email provider and entering credentials/managing Gmail connection.

6.  **Phase 6: Testing, Refinement & Deployment**
    *   **Goal:** Ensure reliability and prepare for use.
    *   **Tasks:**
        *   Write unit tests (backend, agent logic, email modules) and integration tests.
        *   Conduct end-to-end testing (OAuth flow, scheduling, generation, email delivery via different providers).
        *   Refine UI/UX.
        *   Finalize Docker configs and documentation (`docker compose up`).