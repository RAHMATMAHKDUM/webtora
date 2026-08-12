from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

import re

from .models import PasswordResetCode


def _validate_password_strength(password):
    """
    Sama persis kayak aturan di RegisterView -- minimal 8 karakter,
    ada huruf besar, huruf kecil, dan angka. Return pesan error (string)
    kalau nggak valid, atau None kalau valid.
    """
    if len(password) < 8:
        return "Password minimal 8 karakter"
    if not re.search(r"[A-Z]", password):
        return "Password harus mengandung huruf besar (A-Z)"
    if not re.search(r"[a-z]", password):
        return "Password harus mengandung huruf kecil (a-z)"
    if not re.search(r"[0-9]", password):
        return "Password harus mengandung angka (0-9)"
    return None


@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get("email")

    if not email:
        return Response({"detail": "Email wajib diisi."}, status=400)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        # Tetap balas sukses biar nggak bocorin email mana yang terdaftar
        return Response({"message": "Jika email terdaftar, kode telah dikirim."})

    code = PasswordResetCode.generate_code()
    PasswordResetCode.objects.create(user=user, code=code)

    send_mail(
        subject="Kode Reset Password - Website Change Detection",
        message=f"Kode verifikasi kamu: {code}\n\nBerlaku selama 15 menit.",
        from_email=None,
        recipient_list=[email],
    )

    return Response({"message": "Jika email terdaftar, kode telah dikirim."})


@api_view(["POST"])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    email = request.data.get("email")
    code = request.data.get("code")
    new_password = request.data.get("new_password")
    new_password_confirm = request.data.get("new_password_confirm")

    if not email or not code or not new_password:
        return Response({"detail": "Semua field wajib diisi."}, status=400)

    if not new_password_confirm:
        return Response({"detail": "Konfirmasi password wajib diisi."}, status=400)

    if new_password != new_password_confirm:
        return Response({"detail": "Password dan konfirmasi password tidak sama."}, status=400)

    password_error = _validate_password_strength(new_password)
    if password_error:
        return Response({"detail": password_error}, status=400)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"detail": "Kode tidak valid."}, status=400)

    reset_code = (
        PasswordResetCode.objects
        .filter(user=user, code=code, used=False)
        .order_by("-created_at")
        .first()
    )

    if not reset_code or not reset_code.is_valid():
        return Response({"detail": "Kode tidak valid atau sudah kedaluwarsa."}, status=400)

    user.set_password(new_password)
    user.save()

    reset_code.used = True
    reset_code.save()

    return Response({"message": "Password berhasil diubah."})