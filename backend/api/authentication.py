from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from .models import ActiveSession


class SessionAwareJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)

        session_id = validated_token.get("session_id")
        if session_id and not ActiveSession.objects.filter(session_id=session_id).exists():
            raise AuthenticationFailed("Sesi ini sudah berakhir. Silakan login ulang.", code="session_revoked")

        return user