from .models import ActiveSession


class SessionValidationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            auth_header = request.META.get("HTTP_AUTHORIZATION", "")
            if auth_header.startswith("Bearer "):
                token_str = auth_header.split(" ")[1]
                try:
                    from rest_framework_simplejwt.tokens import AccessToken
                    # Access token tidak simpan jti sesi refresh secara langsung,
                    # jadi kita cek berdasarkan ada/tidaknya sesi aktif user ini sama sekali
                    has_session = ActiveSession.objects.filter(user=request.user).exists()
                    if not has_session:
                        from django.http import JsonResponse
                        return JsonResponse({"detail": "Sesi telah berakhir, silakan login ulang."}, status=401)
                except Exception:
                    pass

        return self.get_response(request)