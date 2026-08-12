from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import requests

GEMINI_MODEL = "gemini-flash-latest"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def describe_crop_area(request):
    image_b64 = request.data.get("image")
    if not image_b64:
        return Response({"detail": "Gambar wajib dikirim."}, status=400)

    if not settings.GEMINI_API_KEY:
        return Response({"description": None})

    prompt = (
        "Lihat gambar ini (potongan area dari halaman website). "
        "Kalau berisi teks, sebutkan teksnya persis. "
        "Kalau berupa gambar/visual (bukan teks), jelaskan singkat isinya (maksimal 2 kalimat). "
        "Jawab dalam Bahasa Indonesia, langsung ke intinya."
    )

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": "image/png", "data": image_b64}},
            ]
        }]
    }

    try:
        resp = requests.post(f"{GEMINI_URL}?key={settings.GEMINI_API_KEY}", json=payload, timeout=30)
        data = resp.json()
        if resp.status_code != 200:
            return Response({"description": None})
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        return Response({"description": text})
    except Exception:
        return Response({"description": None})