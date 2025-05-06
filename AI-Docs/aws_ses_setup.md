# AWS SES Setup (Boto3 - Python SDK)

## Prerequisites

1.  **AWS Account:** You need an active AWS account.
2.  **IAM Credentials:** Configure AWS credentials (Access Key ID and Secret Access Key) with permissions to use SES (e.g., `AmazonSESFullAccess` policy or more granular permissions). Boto3 can find credentials in several ways (see Authentication section).
3.  **SES Sender Verification:** Verify the email address or domain you will send emails *from* within the AWS SES console for your chosen region. Emails cannot be sent from unverified identities (unless the account is out of the SES sandbox).
4.  **SES Sandbox (Optional):** New AWS accounts are typically placed in the SES sandbox, which limits sending *to* only verified email addresses/domains and has sending quotas. Request to move out of the sandbox for production use.

## Installation

Install the AWS SDK for Python (Boto3):

```bash
pip install boto3
```

## Authentication

Boto3 automatically searches for AWS credentials in the following order:

1.  **Environment Variables:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` (optional).
2.  **Shared Credential File:** `~/.aws/credentials` (e.g., `[default]` profile).
3.  **AWS Config File:** `~/.aws/config` (can specify credentials and region, e.g., `[profile myprofile]`).
4.  **IAM Role:** Assumed IAM role (e.g., when running on EC2, ECS, Lambda with an assigned role).

You can also explicitly pass credentials when creating a client or session:

```python
import boto3

# Explicit credentials
client = boto3.client(
    'ses',
    region_name='us-east-1', # Specify your SES region
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SECRET_KEY'
    # aws_session_token='YOUR_SESSION_TOKEN' # If using temporary credentials
)

# Using a specific profile from ~/.aws/credentials or ~/.aws/config
session = boto3.Session(profile_name='your_profile_name')
client = session.client('ses', region_name='us-east-1') # Specify region

# Default credentials search (most common)
client = boto3.client('ses', region_name='us-east-1') # Specify region
```

## Sending a Simple Email

Use the `send_email` method of the SES client.

```python
import boto3
from botocore.exceptions import ClientError

# --- Configuration ---
# Ensure AWS credentials are configured (via environment, ~/.aws/, or IAM role)
AWS_REGION = "us-east-1" # Replace with your SES region (e.g., "eu-west-1")
# --------------------

# --- Email Details ---
SENDER = "Your Verified Sender <sender@example.com>" # Must be verified in SES
RECIPIENT = "recipient@example.com" # Must be verified if in sandbox
SUBJECT = "Amazon SES Test (Boto3)"
BODY_TEXT = ("Amazon SES Test (Python)\r\n"
             "This email was sent with Amazon SES using the "
             "AWS SDK for Python (Boto3)."
            )
BODY_HTML = """<html>
<head></head>
<body>
  <h1>Amazon SES Test (Python)</h1>
  <p>This email was sent with
    <a href='https://aws.amazon.com/ses/'>Amazon SES</a> using the
    <a href='https://aws.amazon.com/sdk-for-python/'>
      AWS SDK for Python (Boto3)</a>.</p>
</body>
</html>
            """
CHARSET = "UTF-8"
# --------------------

# Create a new SES resource and specify a region.
client = boto3.client('ses', region_name=AWS_REGION)

# Try to send the email.
try:
    #Provide the contents of the email.
    response = client.send_email(
        Destination={
            'ToAddresses': [
                RECIPIENT,
            ],
            # Add 'CcAddresses': ['cc@example.com'], etc. if needed
        },
        Message={
            'Body': {
                'Html': {
                    'Charset': CHARSET,
                    'Data': BODY_HTML,
                },
                'Text': {
                    'Charset': CHARSET,
                    'Data': BODY_TEXT,
                },
            },
            'Subject': {
                'Charset': CHARSET,
                'Data': SUBJECT,
            },
        },
        Source=SENDER,
        # If you are using a configuration set, uncomment the following line
        # ConfigurationSetName=CONFIGURATION_SET,
        # ReplyToAddresses=[ SENDER ], # Optional
    )
# Display an error if something goes wrong.
except ClientError as e:
    print(f"An error occurred: {e.response['Error']['Message']}")
else:
    print(f"Email sent! Message ID: {response['MessageId']}")

```

## Key Concepts & Links

*   **Credentials:** Boto3 handles finding AWS credentials automatically in most cases.
*   **Region:** SES is region-specific. Ensure you initialize the client in the correct AWS region where your identities are verified and you intend to send from.
*   **Verified Identities:** Crucial prerequisite for sending emails. Verify domains or individual email addresses.
*   **Sandbox:** Limits sending initially. Request removal for production use.
*   **`send_email` Method:** The primary method for sending standard emails.
*   **`send_raw_email` Method:** For sending emails with attachments or more complex MIME structures (not shown here).
*   **`send_templated_email` Method:** For using pre-defined templates stored in SES.
*   **Official Docs & Resources:**
    *   [Boto3 SES Client Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/ses.html)
    *   [Boto3 Credentials Configuration](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html)
    *   [Sending email using Amazon SES (Boto3 Guide)](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/ses-examples.html#sending-email)
    *   [Verifying Identities in Amazon SES](https://docs.aws.amazon.com/ses/latest/dg/verify-addresses-and-domains.html)
    *   [Moving out of the Amazon SES sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)