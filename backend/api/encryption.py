import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings

# Ambil key dari settings, pastikan sudah di-set di .env
_key = base64.b64decode(settings.FIELD_ENCRYPTION_KEY)
_aesgcm = AESGCM(_key)

def encrypt_value(value: str) -> str:
    if not value:
        return value
    nonce = os.urandom(12)  # 96-bit nonce standar GCM
    ciphertext = _aesgcm.encrypt(nonce, value.encode(), None)
    payload = nonce + ciphertext
    return base64.b64encode(payload).decode()

def decrypt_value(value: str) -> str:
    if not value:
        return value
    try:
        payload = base64.b64decode(value.encode())
        nonce = payload[:12]
        ciphertext = payload[12:]
        plaintext = _aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode()
    except Exception:
        return value  # fallback untuk data lama