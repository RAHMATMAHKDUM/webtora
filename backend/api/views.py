from playwright.sync_api import sync_playwright
from django.contrib.auth.models import User
from django.db import transaction
from django.core.mail import send_mail
import base64
import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import UserProfile, EmailVerificationCode


def _validate_password_strength(password):
    """
    Mirror aturan yang sama kayak checklist di frontend:
    minimal 8 karakter, ada huruf besar, huruf kecil, dan angka.
    Return pesan error (string) kalau nggak valid, atau None kalau valid.
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


class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        password_confirm = request.data.get("password_confirm")

        if not username:
            return Response({"error": "Username wajib diisi"}, status=400)

        if not email:
            return Response({"error": "Email wajib diisi"}, status=400)

        if not password:
            return Response({"error": "Password wajib diisi"}, status=400)

        if not password_confirm:
            return Response({"error": "Konfirmasi password wajib diisi"}, status=400)

        if password != password_confirm:
            return Response({"error": "Password dan konfirmasi password tidak sama"}, status=400)

        password_error = _validate_password_strength(password)
        if password_error:
            return Response({"error": password_error}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username sudah digunakan"}, status=400)

        if User.objects.filter(email__iexact=email).exists():
            return Response({"error": "Email sudah digunakan"}, status=400)

        # User dibuat non-aktif dulu -- baru bisa login setelah verifikasi
        # kode OTP yang dikirim ke emailnya.
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_active=False,
            )
            UserProfile.objects.create(user=user)

            code = EmailVerificationCode.objects.create(
                user=user,
                code=EmailVerificationCode.generate_code(),
            )

        try:
            send_mail(
                subject="Kode Verifikasi Email — Webtora",
                message=(
                    f"Halo {username},\n\n"
                    f"Kode verifikasi email kamu adalah: {code.code}\n"
                    f"Kode ini berlaku selama 15 menit.\n\n"
                    f"Kalau kamu tidak merasa mendaftar di layanan ini, abaikan email ini."
                ),
                from_email=None,
                recipient_list=[email],
            )
        except Exception as e:
            # Registrasi tetap dianggap berhasil walau pengiriman email
            # gagal -- user masih bisa minta kode dikirim ulang lewat
            # endpoint /register/resend-code/.
            print(f"[Register] Gagal mengirim email verifikasi: {e}")

        return Response({
            "message": "Registrasi berhasil. Cek email kamu untuk kode verifikasi.",
            "email": email,
        })


from rest_framework.permissions import IsAuthenticated
from .models import MonitoredSite
from .serializers import MonitoredSiteSerializer

class MonitoredSiteListCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        sites = MonitoredSite.objects.filter(
            user=request.user
        )

        serializer = MonitoredSiteSerializer(
            sites,
            many=True
        )

        return Response(
            serializer.data
        )

    def post(self, request):

        serializer = MonitoredSiteSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                user=request.user
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


class MonitoredSiteDetailView(APIView):
    """
    Update parsial (PATCH -- misal toggle is_active) dan hapus (DELETE)
    untuk satu monitoring milik user yang login. Sengaja di-scope ke
    user=request.user, jadi user A tidak bisa ubah/hapus monitoring
    milik user B walau tahu id-nya.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, site_id):
        try:
            site = MonitoredSite.objects.get(id=site_id, user=request.user)
        except MonitoredSite.DoesNotExist:
            return Response({"error": "Monitoring tidak ditemukan"}, status=404)

        serializer = MonitoredSiteSerializer(site, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, site_id):
        try:
            site = MonitoredSite.objects.get(id=site_id, user=request.user)
        except MonitoredSite.DoesNotExist:
            return Response({"error": "Monitoring tidak ditemukan"}, status=404)
        site.delete()
        return Response(status=204)
    
class PreviewWebsiteView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        url = request.data.get("url")

        if not url:

            return Response(
                {
                    "error": "URL wajib diisi"
                },
                status=400
            )

        try:

            with sync_playwright() as p:

                browser = p.chromium.launch(
                    headless=True
                )

                page = browser.new_page()

                page.goto(
                    url,
                    wait_until="networkidle",
                    timeout=30000
                )

                title = page.title()

                html = page.content()

                browser.close()

            return Response(
                {
                    "title": title,
                    "html": html
                }
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=500
            )

class ScreenshotView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        url = request.data.get("url")

        if not url:
            return Response(
                {
                    "error": "URL wajib diisi"
                },
                status=400
            )

        try:

            with sync_playwright() as p:

                browser = p.chromium.launch(
                    headless=True
                )

                page = browser.new_page(
                    viewport={
                        "width": 1440,
                        "height": 3000
                    }
                )

                page.goto(
                    url,
                    wait_until="domcontentloaded",
                    timeout=30000
                )

                page.wait_for_timeout(3000)

                page_height = page.evaluate(
                    "document.documentElement.scrollHeight"
                )

                screenshot = page.screenshot(
                    full_page=True
                )

                browser.close()

            image_base64 = base64.b64encode(
                screenshot
            ).decode("utf-8")

            return Response(
                {
                    "image": image_base64,
                    "viewport_width": 1440,
                    "viewport_height": page_height
                }
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=500
            )
class GetSelectorView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        url = request.data.get("url")
        x = request.data.get("x")
        y = request.data.get("y")

        if not url:

            return Response(
                {
                    "error": "URL wajib diisi"
                },
                status=400
            )

        try:

            with sync_playwright() as p:

                browser = p.chromium.launch(
                    headless=True
                )

                page = browser.new_page(
                    viewport={
                        "width": 1440,
                        "height": 3000
                    }
                )

                page.goto(
                    url,
                    wait_until="networkidle",
                    timeout=30000
                )

                page.wait_for_timeout(2000)

                result = page.evaluate(
                    """
                    ([x,y]) => {

                        let el =
                            document.elementFromPoint(
                                x,
                                y
                            );

                        if(!el)
                            return null;

                        let target = el;

                        for(let i=0;i<5;i++){

                            if(
                                target.innerText &&
                                target.innerText.trim().length > 20
                            ){
                                break;
                            }

                            if(!target.parentElement){
                                break;
                            }

                            target =
                                target.parentElement;
                        }

                        let selector = "";

                        if(target.id){

                            selector =
                                "#" + target.id;

                        }
                        else if(
                            target.className &&
                            typeof target.className === "string"
                        ){

                            selector =
                                target.tagName
                                    .toLowerCase()
                                + "."
                                + target.className
                                    .split(" ")
                                    .join(".");

                        }
                        else{

                            selector =
                                target.tagName
                                    .toLowerCase();

                        }

                        return {
                            selector: selector,
                            text:
                                target.innerText || ""
                        };
                    }
                    """,
                    [x, y]
                )

                browser.close()

                return Response(result)

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=500
            )