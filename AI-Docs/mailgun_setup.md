# Mailgun Setup (Python using Requests)

## Prerequisites

1.  **Mailgun Account:** Sign up for a Mailgun account.
2.  **Domain Setup:** Add and verify your sending domain within Mailgun. This involves DNS record changes (MX, TXT for SPF/DKIM).
3.  **API Key:** Obtain your private API key from the Mailgun control panel (Settings -> API Keys). Store it securely (e.g., as an environment variable `MAILGUN_API_KEY`).
4.  **API Base URL:** Note your API base URL (e.g., `https://api.mailgun.net/v3` or `https://api.eu.mailgun.net/v3` if using the EU region).

## Installation

You'll need the `requests` library, which is a standard for making HTTP calls in Python:

```bash
pip install requests
```

## Authentication

Authentication is done via HTTP Basic Auth using `api` as the username and your private API key as the password.

## Sending a Simple Email

Use the `requests.post` method to send data to the Mailgun `/messages` endpoint for your domain.

```python
import requests
import os

# --- Configuration ---
MAILGUN_API_KEY = os.environ.get("MAILGUN_API_KEY") # Get key from environment
MAILGUN_DOMAIN = "YOUR_DOMAIN_NAME" # Replace with your verified Mailgun domain
MAILGUN_API_BASE_URL = "https://api.mailgun.net/v3" # Or use EU URL if applicable
# --------------------

# --- Email Details ---
sender_email = f"Excited User <mailgun@{MAILGUN_DOMAIN}>" # Or any verified sender
recipient_email = "recipient@example.com" # Change to your recipient
# Can also be a list: ["recipient1@example.com", "recipient2@example.com"]
email_subject = "Hello from Mailgun"
email_body_text = "Testing some Mailgun awesomeness with Python requests!"
# --------------------

def send_mailgun_email():
    if not MAILGUN_API_KEY:
        print("Error: MAILGUN_API_KEY environment variable not set.")
        return None
    if MAILGUN_DOMAIN == "YOUR_DOMAIN_NAME":
        print("Error: Replace YOUR_DOMAIN_NAME with your actual Mailgun domain.")
        return None

    try:
        response = requests.post(
            f"{MAILGUN_API_BASE_URL}/{MAILGUN_DOMAIN}/messages",
            auth=("api", MAILGUN_API_KEY),
            data={"from": sender_email,
                  "to": recipient_email, # requests handles lists correctly here
                  "subject": email_subject,
                  "text": email_body_text
                  # Add "html": "<html>HTML body</html>" for HTML content
                  # Add files=[("attachment", open("file.pdf", "rb"))] for attachments
                  })

        print(f"Status Code: {response.status_code}")
        # print(f"Response Body: {response.text}") # Optional

        response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)
        print("Email sent successfully!")
        return response

    except requests.exceptions.RequestException as e:
        print(f"An error occurred sending email: {e}")
        return None

# --- Example Usage ---
# send_mailgun_email()
```

## Key Concepts & Links

*   **API Key:** Your primary secret for authentication.
*   **Domain:** Your verified sending domain configured in Mailgun.
*   **API Endpoint:** `/messages` endpoint specific to your domain (e.g., `https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages`).
*   **Requests Library:** Standard Python library used for HTTP interactions.
*   **Official Docs (Examples using `requests`):**
    *   [Send Simple Message Sample](https://github.com/mailgun/documentation.git/blob/master/source/samples/send-simple-message.rst) (Source of the primary snippet)
    *   [Mailgun API Reference](https://documentation.mailgun.com/en/latest/api_reference.html)