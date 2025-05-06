# Google OAuth 2.0 Setup (Python Client Library)

## Installation

Install the necessary libraries:

```bash
pip install google-auth google-auth-oauthlib google-api-python-client
```

## Authentication Flow (Web Server / Installed App)

1.  **Obtain Credentials:** Download your `client_secrets.json` file from the Google Cloud Console for your OAuth 2.0 Client ID (type "Web application" or "Desktop app").
2.  **Initialize Flow:** Use `google_auth_oauthlib.flow.Flow` (for web apps) or `google_auth_oauthlib.flow.InstalledAppFlow` (for desktop/local scripts). Load secrets and specify scopes. Crucially, include the `https://www.googleapis.com/auth/gmail.send` scope if you intend to send emails via the Gmail API.

    ```python
    from google_auth_oauthlib.flow import InstalledAppFlow # Or Flow for web apps
    import os

    # Define necessary scopes
    SCOPES = [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/gmail.send' # Scope for sending email
    ]
    CLIENT_SECRETS_FILE = 'path/to/your/client_secrets.json'

    # For local/desktop apps (opens browser, runs local server for redirect)
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)

    # For web apps (requires manual redirect handling)
    # flow = Flow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
    # flow.redirect_uri = 'YOUR_REDIRECT_URI' # e.g., 'https://yourdomain.com/oauth2callback'
    ```
3.  **Run Authorization Flow:**
    *   **Local/Desktop:** `credentials = flow.run_local_server(port=8080)` (or `flow.run_console()`). This handles the user consent process automatically.
    *   **Web App:**
        *   Generate the authorization URL: `authorization_url, state = flow.authorization_url(access_type='offline', include_granted_scopes='true')` (Use `access_type='offline'` to get a refresh token).
        *   Redirect the user to `authorization_url`.
        *   Handle the callback at your `redirect_uri`, extract the `code` parameter.
        *   Exchange the code for tokens: `flow.fetch_token(code=code)`
        *   `credentials = flow.credentials`
4.  **Store Credentials:** The `credentials` object contains access and potentially refresh tokens. Persist these securely (e.g., encrypted in the database, associated with the user). Refresh tokens are needed to obtain new access tokens without user interaction later.

## Building the Gmail API Service Client

Once you have valid `credentials`:

```python
from googleapiclient.discovery import build

try:
    # Build the service object
    service = build('gmail', 'v1', credentials=credentials)
    # Use the 'service' object to interact with the Gmail API
    # e.g., service.users().messages().send(...)
    print("Gmail service created successfully")

    # Example: Get user profile info (requires relevant scopes)
    user_info_service = build('oauth2', 'v2', credentials=credentials)
    user_info = user_info_service.userinfo().get().execute()
    print(f"Authenticated as: {user_info.get('email')}")

except Exception as e:
    print(f"An error occurred building the service: {e}")

# Remember to handle credential refresh if needed
# from google.auth.transport.requests import Request
# if credentials and credentials.expired and credentials.refresh_token:
#     credentials.refresh(Request())
#     # Re-save the refreshed credentials
```

## Key Concepts & Links

*   **Scopes:** Define the permissions your application requests (e.g., `gmail.send`).
*   **Client Secrets:** Contains your application's client ID and secret. Keep this secure.
*   **Redirect URI:** Where Google sends the user back after authorization. Must be registered in your Google Cloud Console credentials.
*   **Access Token:** Short-lived token to make API calls.
*   **Refresh Token:** Long-lived token to obtain new access tokens when they expire (only available if `access_type='offline'` is requested). Store securely.
*   **Official Docs:**
    *   [Python Client Library OAuth Docs](https://github.com/googleapis/google-api-python-client/blob/main/docs/oauth.md)
    *   [Installed App Flow](https://github.com/googleapis/google-api-python-client/blob/main/docs/oauth-installed.md)
    *   [Client Secrets Format](https://github.com/googleapis/google-api-python-client/blob/main/docs/client-secrets.md)
    *   [Using OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
    *   [Gmail API Overview](https://developers.google.com/gmail/api/guides)
    *   [Gmail API `users.messages.send` method](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send)