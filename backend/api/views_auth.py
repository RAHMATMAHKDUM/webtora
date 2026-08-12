from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken

from .models import ActiveSession

MAX_DEVICES = 2


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("username")

        try:
            user_obj = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Email atau password salah.")

        attrs["username"] = user_obj.username
        data = super().validate(attrs)

        sessions = ActiveSession.objects.filter(user=self.user).order_by("created_at")
        if sessions.count() >= MAX_DEVICES:
            excess = sessions.count() - MAX_DEVICES + 1
            for old in sessions[:excess]:
                old.delete()

        device_info = self.context["request"].META.get("HTTP_USER_AGENT", "Unknown device")[:255]
        session = ActiveSession.objects.create(user=self.user, device_info=device_info)

        refresh = self.get_token(self.user)
        refresh["session_id"] = str(session.session_id)
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)

        return data


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class SessionAwareTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = RefreshToken(attrs["refresh"])
        session_id = refresh.get("session_id")

        if session_id and not ActiveSession.objects.filter(session_id=session_id).exists():
            raise InvalidToken("Sesi ini sudah berakhir. Silakan login ulang.")

        return data


class SessionAwareTokenRefreshView(TokenRefreshView):
    serializer_class = SessionAwareTokenRefreshSerializer