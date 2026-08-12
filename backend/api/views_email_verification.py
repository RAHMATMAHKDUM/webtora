from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import EmailVerificationCode


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_registration_code(request):
    email = request.data.get("email")
    code = request.data.get("code")

    if not email or not code:
        return Response({"error": "Email dan kode wajib diisi"}, status=400)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"error": "Email tidak ditemukan"}, status=404)

    if user.is_active:
        return Response({"error": "Akun ini sudah terverifikasi. Silakan login."}, status=400)

    verification = (
        EmailVerificationCode.objects
        .filter(user=user, code=code, used=False)
        .order_by("-created_at")
        .first()
    )

    if not verification or not verification.is_valid():
        return Response({"error": "Kode salah atau sudah kedaluwarsa."}, status=400)

    verification.used = True
    verification.save()

    user.is_active = True
    user.save()

    if hasattr(user, "profile"):
        user.profile.email_verified = True
        user.profile.save()

    return Response({"message": "Email berhasil diverifikasi. Silakan login."})


@api_view(["POST"])
@permission_classes([AllowAny])
def resend_registration_code(request):
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email wajib diisi"}, status=400)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"error": "Email tidak ditemukan"}, status=404)

    if user.is_active:
        return Response({"error": "Akun ini sudah terverifikasi."}, status=400)

    code = EmailVerificationCode.objects.create(
        user=user,
        code=EmailVerificationCode.generate_code(),
    )

    try:
        send_mail(
            subject="Kode Verifikasi Email — Website Change Detection",
            message=(
                f"Halo {user.username},\n\n"
                f"Kode verifikasi email kamu adalah: {code.code}\n"
                f"Kode ini berlaku selama 15 menit."
            ),
            from_email=None,
            recipient_list=[email],
        )
    except Exception as e:
        print(f"[Register] Gagal mengirim ulang kode: {e}")
        return Response({"error": "Gagal mengirim ulang kode. Coba lagi nanti."}, status=500)

    return Response({"message": "Kode verifikasi baru telah dikirim."})