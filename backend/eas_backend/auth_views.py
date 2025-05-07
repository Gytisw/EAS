from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
import os # For accessing environment variables

# IMPORTANT: The user must set GOOGLE_OAUTH_CALLBACK_URL in their environment.
# This URL must match exactly what is configured in the Google Cloud Console
# for the OAuth 2.0 client ID credentials.
# Example: 'http://localhost:3000/auth/google/callback' or your frontend callback URL.
CALLBACK_URL_YOU_SET_ON_GOOGLE = os.environ.get('GOOGLE_OAUTH_CALLBACK_URL', 'YOUR_GOOGLE_CALLBACK_URL_NOT_SET')

class GoogleLogin(SocialLoginView):
    """
    Custom Google Login view for dj_rest_auth.
    Uses Authorization Code Grant.
    """
    adapter_class = GoogleOAuth2Adapter
    callback_url = CALLBACK_URL_YOU_SET_ON_GOOGLE
    client_class = OAuth2Client

    def get_callback_url(self, request, app):
        # Allow callback_url to be dynamically set if needed, or fall back to settings
        # For now, we use the one from settings/environment variable.
        # You could also pass it from the frontend if your setup requires it.
        return self.callback_url