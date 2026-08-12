from django.db import models
from .encryption import encrypt_value, decrypt_value


class EncryptedTextField(models.TextField):
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return decrypt_value(value)

    def to_python(self, value):
        return value

    def get_prep_value(self, value):
        if value is None:
            return value
        return encrypt_value(str(value))