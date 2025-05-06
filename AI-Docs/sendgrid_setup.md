# SendGrid Setup (Python SDK)

## Prerequisites

1.  **SendGrid Account:** Sign up and potentially upgrade from the free trial.
2.  **API Key:** Create an API key with "Mail Send" > "Full Access" permissions. Store it securely, typically as an environment variable (e.g., `SENDGRID_API_KEY`).
3.  **Sender Verification:** Verify your sending domain (Domain Authentication - recommended) or a single sender email address (Single Sender Verification - for testing only).

## Installation

Install the official SendGrid Python library using pip:

```bash
pip install sendgrid
```

## Authentication

Authentication is handled via the API key. The library uses the key from the environment variable when initialized:

```python
import sendgrid
import os

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
```

## Sending a Simple Email

Use the `Mail`, `Email`, `To`, and `Content` helpers to construct the email object, then use the `SendGridAPIClient` instance to send it via the v3 Mail Send API endpoint.

```python
import sendgrid
import os
from sendgrid.helpers.mail import Mail, Email, To, Content

# Ensure SENDGRID_API_KEY environment variable is set
sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))

# --- Change these values ---
sender_email = "your_verified_sender@example.com"
recipient_email = "recipient@example.com"
email_subject = "Sending with SendGrid is Fun"
email_body_text = "and easy to do anywhere, even with Python"
# -------------------------

from_email = Email(sender_email)
to_email = To(recipient_email) # Can also be a list of To objects for multiple recipients
subject = email_subject
content = Content("text/plain", email_body_text) # Use "text/html" for HTML content

mail = Mail(from_email, to_email, subject, content)

# Get a JSON-ready representation of the Mail object
mail_json = mail.get()

try:
    # Send an HTTP POST request to /mail/send
    response = sg.client.mail.send.post(request_body=mail_json)

    print(f"Status Code: {response.status_code}") # Should be 202 if successful
    # print(response.body) # Optional: view response body
    # print(response.headers) # Optional: view response headers

    if response.status_code == 202:
        print("Email sent successfully!")
    else:
        print("Email sending failed.")

except Exception as e:
    print(f"An error occurred: {e}")

```

## Key Concepts & Links

*   **API Key:** Used for authentication. Keep it secure.
*   **Verified Sender:** Your 'From' address must be verified via Domain Authentication or Single Sender Verification.
*   **Mail Helper:** Simplifies constructing the JSON payload for the API.
*   **Official Docs & Resources:**
    *   [SendGrid Python Quickstart](https://www.twilio.com/docs/sendgrid/for-developers/sending-email/quickstart-python)
    *   [SendGrid Python Library (GitHub)](https://github.com/sendgrid/sendgrid-python)
    *   [SendGrid v3 Mail Send API Reference](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
    *   [SendGrid Python Library Usage (More Examples)](https://github.com/sendgrid/sendgrid-python/blob/main/USAGE.md)