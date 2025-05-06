# Django ORM Field Encryption with django-fernet-encrypted-fields

This document summarizes how to implement encrypted fields in Django models using the `django-fernet-encrypted-fields` library, suitable for storing sensitive data like API keys and OAuth tokens in a PostgreSQL database.

## Recommended Library: django-fernet-encrypted-fields

*   **Repository:** [jazzband/django-fernet-encrypted-fields](https://github.com/jazzband/django-fernet-encrypted-fields)
*   **Description:** Provides Fernet symmetric encryption for Django model fields. Fernet is built on AES-128 in CBC mode with PKCS7 padding, and HMAC with SHA256 for authentication.
*   **Note:** The library was renamed to `django-fernet-encrypted-fields` from `django-encrypted-fields` and is maintained by Jazzband. The snippets seem to refer to the newer `encrypted_fields.fields` import path.

## Setup & Configuration

1.  **Installation:**
    ```bash
    pip install django-fernet-encrypted-fields
    ```

2.  **Add to `INSTALLED_APPS`:**
    In your `settings.py`:
    ```python
    INSTALLED_APPS = [
        # ... other apps
        'encrypted_fields', # This is the app name for django-fernet-encrypted-fields
        # ...
    ]
    ```

3.  **Configure Keys in `settings.py`:**
    *   **`FERNET_KEYS` (Primary for this library):** This setting expects a list of Fernet keys. The first key is used for encryption, and all keys are tried for decryption. This allows for key rotation.
        ```python
        # settings.py
        from cryptography.fernet import Fernet

        # Generate keys (DO THIS ONCE and store securely, e.g., in environment variables)
        # key1 = Fernet.generate_key().decode()
        # print(f"FERNET_KEY_1='{key1}'")

        FERNET_KEYS = [
            os.environ.get('FERNET_KEY_1'), # Primary key for new encryptions
            # os.environ.get('OLD_FERNET_KEY_1'), # Older key for decryption during rotation
        ]
        # Ensure FERNET_KEY_1 is set in your environment.
        # For multiple keys during rotation, add them to the list.
        ```
        **Important:** Generate these keys using `Fernet.generate_key().decode()` and store them securely (e.g., environment variables, secrets manager). **DO NOT commit them directly into `settings.py` in version control.**

    *   **Django's `SECRET_KEY`:** Standard Django secret key, also needs to be kept secure. While `django-fernet-encrypted-fields` primarily uses `FERNET_KEYS`, Django's `SECRET_KEY` is crucial for overall project security.

## Usage in Models

Define encrypted fields in your `models.py` using the provided field types from `encrypted_fields.fields`.

*   **Example Model:**
    ```python
    # myapp/models.py
    from django.db import models
    from encrypted_fields import fields # Correct import path

    class ApiCredentials(models.Model):
        service_name = models.CharField(max_length=100, unique=True)
        api_key = fields.EncryptedCharField(max_length=255, help_text="Encrypted API Key")
        # For longer secrets like OAuth refresh tokens, EncryptedTextField is better
        oauth_refresh_token = fields.EncryptedTextField(blank=True, null=True, help_text="Encrypted OAuth Refresh Token")
        notes = models.TextField(blank=True, null=True)

        def __str__(self):
            return self.service_name

    class UserSensitiveData(models.Model):
        user = models.OneToOneField('auth.User', on_delete=models.CASCADE)
        email_provider_password = fields.EncryptedCharField(max_length=200, blank=True, null=True)
        # other sensitive fields
    ```

*   **Available Encrypted Fields (from `encrypted_fields.fields`):**
    *   `EncryptedCharField`
    *   `EncryptedTextField`
    *   `EncryptedDateField`
    *   `EncryptedDateTimeField`
    *   `EncryptedEmailField`
    *   `EncryptedIntegerField`
    *   `EncryptedPositiveIntegerField`
    *   `EncryptedPositiveSmallIntegerField`
    *   `EncryptedSmallIntegerField`
    *   `EncryptedBigIntegerField`
    *   `EncryptedFloatField` (Note: Precision issues with floats and encryption can sometimes occur)
    *   `EncryptedBooleanField` (Stores as an encrypted string like "True" or "False")
    *   `EncryptedJSONField` (If using Django 3.1+ and PostgreSQL, requires ` psycopg2-binary`)

## Data Access

*   **Encryption:** Data assigned to an encrypted field is automatically encrypted when the model instance is saved to the database.
*   **Decryption:** Data is automatically decrypted when the field is accessed from a model instance.

    ```python
    cred = ApiCredentials(service_name='TestService', api_key='supersecretkey')
    cred.save() # 'supersecretkey' is now encrypted in the database

    retrieved_cred = ApiCredentials.objects.get(service_name='TestService')
    print(retrieved_cred.api_key) # Prints 'supersecretkey' (decrypted)
    ```

## Querying Encrypted Fields

*   **Direct Querying Limitation:** You **cannot** directly filter or query encrypted fields using their plaintext values in database lookups (e.g., `ApiCredentials.objects.filter(api_key='supersecretkey')` will NOT work as expected because the database stores the ciphertext).
*   **Exact Match Workaround (Limited):** The library provides a way to search for exact matches if you encrypt the search term with the same key first. However, this is generally not how it's used for lookups.
*   **Practical Approach:** Retrieve a broader set of records (if necessary) and then filter/search in Python by iterating and accessing the decrypted values. This is only suitable for small datasets or when you can narrow down the initial queryset significantly using non-encrypted fields.
    ```python
    # Example: Filtering in Python (potentially inefficient for large tables)
    # query = "supersecretkey"
    # for cred in ApiCredentials.objects.filter(service_name__startswith="Test"): # Filter by non-encrypted field first
    #     if cred.api_key == query: # Decryption happens here
    #         print(f"Found: {cred.service_name}")
    #         break
    ```
*   **Indexing:** Standard database indexes on encrypted fields will index the ciphertext, not the plaintext, so they are not useful for searching by plaintext content.

## Key Management & Rotation

*   **`FERNET_KEYS` Rotation:**
    To rotate keys, add a new key to the *beginning* of the `FERNET_KEYS` list in `settings.py`.
    ```python
    # settings.py
    FERNET_KEYS = [
        os.environ.get('NEW_FERNET_KEY'),  # New primary key for encryption
        os.environ.get('OLD_FERNET_KEY_1'), # Old key, used for decryption
        os.environ.get('OLDER_FERNET_KEY_2'),# Even older key for decryption
    ]
    ```
    New data will be encrypted with `NEW_FERNET_KEY`. Existing data encrypted with older keys in the list can still be decrypted.
*   **Data Re-encryption:** To migrate all data to be encrypted with the new primary key, you must retrieve and re-save each model instance that contains encrypted fields. This can be done via a Django management command.
    ```python
    # Example management command (myapp/management/commands/reencrypt_data.py)
    from django.core.management.base import BaseCommand
    from myapp.models import ApiCredentials # Import your models

    class Command(BaseCommand):
        help = 'Re-encrypts all data in models with encrypted fields using the current primary Fernet key.'

        def handle(self, *args, **options):
            self.stdout.write('Starting data re-encryption...')
            for model_class in [ApiCredentials]: # Add all relevant models
                self.stdout.write(f'Processing {model_class.__name__}...')
                count = 0
                for instance in model_class.objects.all():
                    instance.save() # Re-saving will use the new primary key for encryption
                    count += 1
                self.stdout.write(f'Re-encrypted {count} instances of {model_class.__name__}.')
            self.stdout.write(self.style.SUCCESS('Data re-encryption complete.'))
    ```
    Run with `python manage.py reencrypt_data`. After re-encryption and ensuring all systems use the new key, older keys can eventually be removed from `FERNET_KEYS`.

## Security Considerations

*   **Key Secrecy:** The security of your `FERNET_KEYS` is paramount. If these keys are compromised, all encrypted data can be decrypted. Use environment variables or a dedicated secrets management service (like HashiCorp Vault, AWS Secrets Manager) to store them.
*   **Database Security:** While fields are encrypted, if an attacker gains shell access to your Django application server and can access your settings (where keys might be loaded into memory), they could potentially decrypt data. Defense in depth is important.
*   **Performance:** Encryption/decryption adds overhead. For very high-traffic sites or very large pieces of data, benchmark the impact. For typical API keys and tokens, the impact is usually acceptable.
*   **Backups:** Database backups will contain the encrypted ciphertext. Ensure your `FERNET_KEYS` are also backed up securely and separately. Without the keys, backed-up encrypted data is useless.
*   **Salt:** Fernet includes a salt internally as part of its mechanism.

## Alternatives

*   **`django-cryptography`:** Another popular library. Uses OpenSSL for encryption. Offers a different set of features and configuration.
*   **PostgreSQL `pgcrypto`:** Database-level encryption. Allows encryption/decryption via SQL functions. Can be more complex to manage keys and integrate seamlessly with the ORM for automatic encryption/decryption. Querying can sometimes be more flexible if using deterministic encryption (less secure) or specific indexing strategies with `pgcrypto`.

`django-fernet-encrypted-fields` offers a good balance of strong encryption and ease of use at the application level for Django projects.