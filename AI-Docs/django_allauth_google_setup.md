# Django-Allauth Google OAuth 2.0 Setup

This document outlines the steps to integrate Google OAuth 2.0 authentication into a Django project using `django-allauth`.

## 1. Installation

Install `django-allauth` with social account support:

```bash
pip install "django-allauth[socialaccount]"
```

If you plan to use OpenID features (which Google can leverage), you might also need:
```bash
pip install "django-allauth[socialaccount,openid]"
```
For MFA (Multi-Factor Authentication), which is good practice:
```bash
pip install "django-allauth[mfa]"
```

## 2. Setup & Configuration (`settings.py`)

### 2.1. `INSTALLED_APPS`

Add the necessary `allauth` applications to your `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    # ... other apps
    'django.contrib.auth',
    'django.contrib.messages', # Required by allauth
    'django.contrib.sites',    # Required by allauth

    'allauth',
    'allauth.account',
    'allauth.socialaccount',

    # Specific Google provider
    'allauth.socialaccount.providers.google',

    # Optional, if using MFA
    # 'allauth.mfa',
    # Optional, for user sessions management
    # 'allauth.usersessions',
    # Optional, for headless (SPA) setup
    # 'allauth.headless',
]
```

### 2.2. `AUTHENTICATION_BACKENDS`

Configure the authentication backends:

```python
AUTHENTICATION_BACKENDS = [
    # Needed to login by username in Django admin, regardless of `allauth`
    'django.contrib.auth.backends.ModelBackend',

    # `allauth` specific authentication methods, such as login by email
    'allauth.account.auth_backends.AuthenticationBackend',
]
```

### 2.3. `SITE_ID`

`django-allauth` requires the Django sites framework. Set `SITE_ID`:

```python
SITE_ID = 1
```

### 2.4. `TEMPLATES` Context Processor

Ensure the `request` context processor is available for `allauth` templates:

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [], # Your project's template DIRS
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request', # `allauth` needs this
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

### 2.5. `MIDDLEWARE`

Add the `AccountMiddleware` from `allauth`:

```python
MIDDLEWARE = [
    # ... other middleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    # ... other middleware

    # Add the account middleware:
    "allauth.account.middleware.AccountMiddleware",
]
```

### 2.6. `SOCIALACCOUNT_PROVIDERS` for Google

Configure the Google provider settings. This is where you define scopes, authentication parameters, and your Client ID and Secret.

```python
import os # if using environment variables

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        # Method 1: Storing Client ID and Secret directly in settings (suitable for environment variables)
        # 'APP': {
        #     'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
        #     'secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
        #     'key': '' # Can be empty
        # },
        # Method 2 (Recommended): Using a SocialApp model instance configured in Django Admin
        # If you use this method, you don't need the 'APP' dictionary here.
        # You will create a SocialApp in Django Admin (/admin/socialaccount/socialapp/)
        # and provide the Client ID and Secret there.

        'SCOPE': [
            'profile',
            'email',
            'openid', # Often included for more robust authentication
            'https://www.googleapis.com/auth/gmail.send', # For sending emails via Gmail API
        ],
        'AUTH_PARAMS': {
            'access_type': 'offline',  # To get a refresh token
            # 'prompt': 'consent', # Optional: to ensure the refresh token is always sent
        },
        'OAUTH_PKCE_ENABLED': True, # Recommended for security
        # Optional: If you want to fetch additional user info like avatar
        # 'FETCH_USERINFO': True,
        # Optional: If you want to allow authentication only via email from Google
        # 'EMAIL_AUTHENTICATION': True
    }
}
```

**Explanation of Scopes and Auth Params:**
*   **`SCOPE`**:
    *   `profile`: Access basic profile information.
    *   `email`: Access the user's primary email address.
    *   `openid`: Standard scope for OpenID Connect.
    *   `https://www.googleapis.com/auth/gmail.send`: This is crucial if you intend to send emails on behalf of the user using their Gmail account. `django-allauth` will request this permission during the OAuth flow.
*   **`AUTH_PARAMS`**:
    *   `access_type: 'offline'`: This is **essential** to receive a refresh token from Google. Refresh tokens allow your application to obtain new access tokens without requiring the user to log in again, which is necessary for background tasks like sending scheduled emails.
*   **Client ID and Secret Storage**:
    *   The `django-allauth` documentation shows two main ways:
        1.  Directly in `settings.py` within an `APPS` list (or a single `APP` dict for Google). This is suitable if you load them from environment variables (e.g., `os.environ.get('GOOGLE_CLIENT_ID')`).
        2.  Via the `SocialApp` model in the Django admin (`/admin/socialaccount/socialapp/`). This is generally the recommended approach as it keeps secrets out of your settings file and allows for easier management. If you use this, you don't need the `APP` dictionary in `SOCIALACCOUNT_PROVIDERS` for Google, but you still need the `SCOPE` and `AUTH_PARAMS` at the top level of the `google` provider dictionary.

## 3. URL Configuration (`urls.py`)

Include `allauth.urls` in your project's `urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')), # For allauth views (login, signup, social, etc.)
    # If using headless mode for an SPA:
    # path('_allauth/', include('allauth.headless.urls')),
    # ... your other app urls
]
```

## 4. Database Migrations

Run migrations to create the necessary database tables for `django-allauth`:

```bash
python manage.py migrate
```

## 5. Google Cloud Console Setup

1.  **Create a Project:** If you don't have one, create a new project in the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Enable APIs:**
    *   Go to "APIs & Services" > "Library".
    *   Search for and enable the "Gmail API" (if you need the `gmail.send` scope).
    *   Search for and enable the "Google People API" (often used for profile information).
3.  **Configure OAuth Consent Screen:**
    *   Go to "APIs & Services" > "OAuth consent screen".
    *   Choose "User Type" (likely "External" unless for an internal GSuite org).
    *   Fill in the application name, user support email, and developer contact information.
    *   **Scopes:** Add the scopes you configured in `settings.py` (e.g., `../auth/userinfo.email`, `../auth/userinfo.profile`, `openid`, and importantly `https://www.googleapis.com/auth/gmail.send`).
    *   **Test Users:** Add test users while your app is in "testing" mode.
4.  **Create Credentials:**
    *   Go to "APIs & Services" > "Credentials".
    *   Click "Create Credentials" > "OAuth client ID".
    *   **Application type:** Select "Web application".
    *   **Name:** Give your OAuth client ID a name (e.g., "EAS Web Client").
    *   **Authorized JavaScript origins:** (Usually not needed for server-side flow with `django-allauth`).
    *   **Authorized redirect URIs:** This is critical. `django-allauth` typically uses a path like `/accounts/<provider>/login/callback/`. So, for Google, you should add:
        *   `http://localhost:8000/accounts/google/login/callback/` (for local development)
        *   `http://127.0.0.1:8000/accounts/google/login/callback/` (for local development)
        *   `https://yourdomain.com/accounts/google/login/callback/` (for production)
    *   Click "Create". You will be shown your **Client ID** and **Client Secret**.
5.  **Store Client ID and Secret (in Django Admin via `SocialApp` - Recommended):**
    *   In your Django Admin interface, go to "Social Accounts" > "Social applications" (or `/admin/socialaccount/socialapp/`).
    *   Click "Add SocialApp".
        *   Provider: Select "Google".
        *   Name: e.g., "Google".
        *   Client ID: Paste the Client ID from Google Cloud Console.
        *   Secret key: Paste the Client Secret from Google Cloud Console.
        *   Sites: Select your site (usually `example.com` or your actual domain, corresponding to `SITE_ID = 1`).
        *   Save.

## 6. Login/Logout Flow

### Login

In your Django templates, you can provide a link to initiate the Google login flow using the `provider_login_url` template tag:

```html
{% load socialaccount %}

<a href="{% provider_login_url 'google' %}">Login with Google</a>
```
When a user clicks this link, `django-allauth` handles the redirect to Google, the OAuth handshake, and upon successful authentication, creates or logs in the user in your Django application.

### Logout

Logout is handled by `django-allauth`'s `account_logout` view. Ensure logout is done via a POST request for security.

In your template:
```html
<form method="post" action="{% url 'account_logout' %}">
  {% csrf_token %}
  <button type="submit">Logout</button>
</form>
```

## 7. Accessing Tokens

After a user logs in via Google and grants the necessary permissions (especially with `access_type='offline'`), `django-allauth` stores the access token and refresh token in the `SocialToken` model, linked to the user's `SocialAccount`.

To access these tokens for a logged-in user:

```python
from allauth.socialaccount.models import SocialToken, SocialApp, SocialAccount

def get_google_tokens(user):
    if not user.is_authenticated:
        return None, None, None # access_token, refresh_token, token_expires_at

    try:
        social_account = user.socialaccount_set.get(provider='google')
        social_token = SocialToken.objects.filter(account=social_account).first()

        if social_token:
            access_token = social_token.token
            refresh_token = social_token.token_secret # For OAuth2, refresh token is stored in token_secret
            expires_at = social_token.expires_at # datetime object for when the access token expires

            # For manual token refresh, you might need client_id and client_secret
            # social_app = SocialApp.objects.get(provider=social_account.provider)
            # client_id = social_app.client_id
            # client_secret = social_app.secret

            return access_token, refresh_token, expires_at
        else:
            return None, None, None
    except (SocialAccount.DoesNotExist, SocialToken.DoesNotExist):
        return None, None, None

# Example usage:
# access_token, refresh_token, expires_at = get_google_tokens(request.user)
# if access_token and refresh_token:
#     # Use the tokens to make API calls to Google (e.g., Gmail API)
#     # Check if access_token is expired using expires_at before using it.
#     # If expired, use refresh_token to get a new access_token.
```

**Important Notes on Tokens:**
*   **Refresh Token:** The refresh token (`social_token.token_secret`) is long-lived and crucial for obtaining new access tokens.
*   **Token Expiry:** Access tokens (`social_token.token`) are short-lived. `social_token.expires_at` tells you when it expires. You'll need to handle their expiry and use the refresh token to get a new one. Google's client libraries (e.g., `google-auth-library-python`) can help manage this.
*   **`gmail.send` Scope:** If you requested this scope and the user granted it, the obtained access token can be used to authorize requests to the Gmail API.

This summary is based on the provided snippets and general `django-allauth` knowledge. For the most detailed and up-to-date information, always refer to the official `django-allauth` documentation.