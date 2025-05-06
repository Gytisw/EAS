# Gmail API Setup (Python Client - Sending Email)

## Prerequisites

1.  **Google OAuth Setup:** Complete the steps outlined in the "Google OAuth 2.0 Setup (Python Client Library)" section, ensuring you requested the `https://www.googleapis.com/auth/gmail.send` scope during the authorization flow. You need a valid `credentials` object (obtained via `flow.run_local_server()`, `flow.run_console()`, or `flow.fetch_token()`).
2.  **Installation:** Ensure you have the necessary libraries installed:
    ```bash
    pip install google-auth google-auth-oauthlib google-api-python-client
    ```

## Authentication

Use the `credentials` object obtained from the OAuth 2.0 flow. Ensure it's valid (refresh if necessary).

```python
# Assuming 'credentials' is your valid google.oauth2.credentials.Credentials object
# from the OAuth flow (potentially loaded from storage like a pickle file)

# Example of refreshing if needed:
# from google.auth.transport.requests import Request
# if credentials and credentials.expired and credentials.refresh_token:
#     credentials.refresh(Request())
#     # Save the refreshed credentials back to storage
```

## Building the Gmail Service Client

Use the `build` function from `googleapiclient.discovery`, specifying the 'gmail' service, version 'v1', and your credentials.

```python
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

try:
    service = build('gmail', 'v1', credentials=credentials)
    print("Gmail API service created successfully.")
except HttpError as error:
    print(f'An error occurred building the Gmail service: {error}')
    service = None
except Exception as e:
    print(f'An unexpected error occurred: {e}')
    service = None

```

## Sending a Simple Email

Sending email via the Gmail API requires constructing a raw email message compliant with RFC 2822, encoding it in base64url format, and passing it to the `users().messages().send()` method.

```python
import base64
from email.mime.text import MIMEText
from googleapiclient.errors import HttpError

def create_message(sender, to, subject, message_text):
  """Create a message for an email.

  Args:
    sender: Email address of the sender.
    to: Email address of the receiver.
    subject: The subject of the email message.
    message_text: The text of the email message.

  Returns:
    An object containing a base64url encoded email object.
  """
  message = MIMEText(message_text)
  message['to'] = to
  message['from'] = sender
  message['subject'] = subject
  # Encode the message string into bytes, then base64url encode it
  raw_message_bytes = message.as_bytes()
  encoded_message = base64.urlsafe_b64encode(raw_message_bytes).decode('utf-8')
  return {'raw': encoded_message}

def send_message(service, user_id, message):
  """Send an email message.

  Args:
    service: Authorized Gmail API service instance.
    user_id: User's email address. The special value "me"
    can be used to indicate the authenticated user.
    message: Message to be sent.

  Returns:
    Sent Message Id if successful, None otherwise.
  """
  try:
    sent_message = (service.users().messages().send(userId=user_id, body=message)
                   .execute())
    print(f'Message Id: {sent_message["id"]}')
    return sent_message['id']
  except HttpError as error:
    print(f'An error occurred sending email: {error}')
    return None
  except Exception as e:
    print(f'An unexpected error occurred: {e}')
    return None

# --- Example Usage ---
if service:
    # --- Email Details ---
    sender_address = "me" # Use "me" to refer to the authenticated user's email
    recipient_address = "recipient@example.com"
    email_subject = "Testing Gmail API Send"
    email_body = "Hello from the Gmail API using Python!"
    # --------------------

    # Create the message payload
    message_payload = create_message(sender_address, recipient_address, email_subject, email_body)

    # Send the message
    if message_payload:
        send_message(service, "me", message_payload)

```

## Key Concepts & Links

*   **Credentials:** Must have the `gmail.send` scope granted by the user.
*   **Service Object:** Built using `build('gmail', 'v1', credentials=credentials)`.
*   **MIME Message:** Emails must be constructed using standard email formats (e.g., `email.mime.text.MIMEText`).
*   **Base64url Encoding:** The raw MIME message must be base64url encoded before sending.
*   **`users().messages().send()`:** The API method used to send the message. `userId='me'` refers to the authenticated user.
*   **Official Docs & Resources:**
    *   [Gmail API Overview](https://developers.google.com/gmail/api/guides)
    *   [Gmail API Python Quickstart](https://developers.google.com/gmail/api/quickstart/python) (Includes full auth flow and listing labels)
    *   [Gmail API `users.messages.send` Reference](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send)
    *   [Creating Messages Guide](https://developers.google.com/gmail/api/guides/sending#creating_messages)
    *   [Python `email.mime` examples](https://docs.python.org/3/library/email.examples.html)