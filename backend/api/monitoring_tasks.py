import base64
import hashlib
import re
import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.mail import send_mail
from playwright.sync_api import sync_playwright

from .models import MonitoredSite, SiteCheckLog


UNIT_TO_MINUTES = {"minute": 1, "hour": 60, "day": 1440, "week": 10080}
WEEKDAY_MAP = {0: "mon", 1: "tue", 2: "wed", 3: "thu", 4: "fri", 5: "sat", 6: "sun"}

GEMINI_MODEL = "gemini-flash-latest"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"


def _normalize_text(text):
    """Rapikan whitespace supaya perbedaan spasi/enter sepele tidak dianggap perubahan."""
    return re.sub(r"\s+", " ", text or "").strip()


def _capture(site):
    """
    Ambil konten sesuai monitor_type.
    Return tuple: (is_image: bool, payload) -- payload adalah bytes (gambar) atau str (teks).
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(site.url, wait_until="networkidle", timeout=30000)

        if site.monitor_type == "fullpage":
            content = page.screenshot(full_page=True)
            browser.close()
            return True, content

        if site.monitor_type == "crop":
            from PIL import Image
            from io import BytesIO
 
            full_screenshot = page.screenshot(full_page=True)
            browser.close()
 
            img = Image.open(BytesIO(full_screenshot))
            x = site.crop_x or 0
            y = site.crop_y or 0
            w = site.crop_width or 100
            h = site.crop_height or 100
 
            cropped = img.crop((x, y, x + w, y + h))
            buf = BytesIO()
            cropped.save(buf, format="PNG")
            return True, buf.getvalue()

        # default: selector
        selector = site.css_selector or "body"
        try:
            text = page.locator(selector).inner_text()
        except Exception:
            text = page.content()
        browser.close()
        return False, _normalize_text(text)


def _hash_payload(is_image, payload):
    if is_image:
        return hashlib.sha256(payload).hexdigest()
    return hashlib.sha256(payload.encode()).hexdigest()


def _analyze_image_with_gemini(old_bytes, new_bytes, site_url, context_label="halaman"):
    if not settings.GEMINI_API_KEY:
        print("[Gemini] GEMINI_API_KEY kosong, analisis AI dilewati.")
        return None

    prompt = (
        f"Kamu adalah asisten yang membandingkan dua screenshot {context_label} dari website "
        f"({site_url}) — gambar pertama SEBELUM, gambar kedua SESUDAH. "
        "Jelaskan secara spesifik dan ringkas (maksimal 4 kalimat) apa yang berubah antara kedua gambar. "
        "Fokus ke perubahan konten yang bermakna (harga, teks, stok, pengumuman, dll), "
        "abaikan perbedaan sepele seperti jam/tanggal real-time, animasi, atau iklan acak. "
        "Jawab dalam Bahasa Indonesia."
    )

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": "image/png", "data": base64.b64encode(old_bytes).decode()}},
                {"inline_data": {"mime_type": "image/png", "data": base64.b64encode(new_bytes).decode()}},
            ]
        }]
    }

    return _call_gemini(payload)


def _analyze_text_with_gemini(old_text, new_text, site_url):
    if not settings.GEMINI_API_KEY:
        print("[Gemini] GEMINI_API_KEY kosong, analisis AI dilewati.")
        return None

    prompt = (
        f"Kamu membandingkan dua versi teks dari elemen tertentu di website ({site_url}).\n\n"
        f"TEKS SEBELUM:\n{old_text}\n\n"
        f"TEKS SESUDAH:\n{new_text}\n\n"
        "Jelaskan secara spesifik dan ringkas (maksimal 3 kalimat) apa yang berubah. "
        "Kalau berupa angka/harga, sebutkan nilai lama dan baru secara eksplisit. "
        "Jawab dalam Bahasa Indonesia."
    )

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    return _call_gemini(payload)


def _call_gemini(payload):
    try:
        resp = requests.post(
            f"{GEMINI_URL}?key={settings.GEMINI_API_KEY}",
            json=payload,
            timeout=30,
        )
        data = resp.json()

        if resp.status_code != 200:
            print(f"[Gemini] Error {resp.status_code}: {data}")
            return None

        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return text.strip()
    except Exception as e:
        print(f"[Gemini] Exception: {e}")
        return None


def _monitor_type_label(site):
    if site.monitor_type == "crop":
        return "Area Crop / Crop Area"
    if site.monitor_type == "fullpage":
        return "Full Page + AI Analysis"
    return "Elemen CSS Selector / CSS Selector Element"


def _send_change_email(site, log):
    if not site.notify_email:
        return

    target = site.email_target or site.user.email
    if not target:
        return

    formatted_time = log.checked_at.strftime('%d %B %Y, %H:%M')

    ai_block_id = ""
    ai_block_en = ""
    if log.ai_summary:
        ai_block_id = f"\n\nRingkasan Perubahan (AI):\n{log.ai_summary}\n"
        ai_block_en = f"\n\nChange Summary (AI):\n{log.ai_summary}\n"

    message = f"""Halo {site.user.username},

Kami mendeteksi adanya perubahan konten pada situs web yang Anda pantau. Berikut detailnya:

URL Situs         : {site.url}
Tipe Monitoring   : {_monitor_type_label(site)}
Waktu Deteksi     : {formatted_time} WIB
{ai_block_id}
Silakan masuk ke dashboard Anda untuk melihat detail perubahan dan riwayat pemantauan selengkapnya.

Terima kasih telah menggunakan layanan kami.

Salam,
Tim Website WebTora

-----------------------------------------

Hello {site.user.username},

We have detected a content change on a website you are currently monitoring. Details below:

Site URL           : {site.url}
Monitoring Type    : {_monitor_type_label(site)}
Detected At        : {formatted_time} WIB (Western Indonesia Time)
{ai_block_en}
Please log in to your dashboard to view the full change details and monitoring history.

Thank you for using our service.

Best regards,
Website WebTora Team
"""

    send_mail(
        subject=f"🔔 Perubahan Terdeteksi / Change Detected — {site.url}",
        message=message,
        from_email=None,
        recipient_list=[target],
    )


def _send_change_telegram(site, log):
    if not site.notify_telegram:
        return

    chat_id = site.telegram_chat_id or (
        site.user.profile.telegram_chat_id if hasattr(site.user, "profile") else None
    )

    if not chat_id:
        return

    if not settings.TELEGRAM_BOT_TOKEN:
        print("[Telegram] TELEGRAM_BOT_TOKEN kosong, notifikasi dilewati.")
        return

    formatted_time = log.checked_at.strftime('%d %B %Y, %H:%M')

    ai_block = ""
    if log.ai_summary:
        ai_block = f"\n🤖 *Analisis AI:*\n{log.ai_summary}\n"

    text = (
        f"🔔 *Perubahan Konten Terdeteksi*\n"
        f"🔔 *Content Change Detected*\n\n"
        f"🔗 *URL:* {site.url}\n"
        f"🧩 *Tipe / Type:* {_monitor_type_label(site)}\n"
        f"🕒 *Waktu / Time:* {formatted_time} WIB\n"
        f"{ai_block}\n"
        f"🇮🇩 Konten pada situs yang Anda pantau telah berubah. Silakan cek dashboard untuk detail lengkap.\n\n"
        f"🇬🇧 The content on your monitored website has changed. Please check your dashboard for full details."
    )

    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
            json={
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "Markdown",
            },
            timeout=10,
        )
        print(f"[Telegram] Status: {resp.status_code}, Response: {resp.text}")
    except Exception as e:
        print(f"[Telegram] Error mengirim notifikasi: {e}")


def check_site(site_id):
    try:
        site = MonitoredSite.objects.get(id=site_id, is_active=True)
    except MonitoredSite.DoesNotExist:
        return

    try:
        is_image, payload = _capture(site)
    except Exception as e:
        SiteCheckLog.objects.create(site=site, error=str(e))
        return

    new_hash = _hash_payload(is_image, payload)

    last_log = site.check_logs.exclude(content_hash__isnull=True).first()
    changed = bool(last_log and last_log.content_hash != new_hash)

    log = SiteCheckLog.objects.create(
        site=site,
        content_hash=new_hash,
        changed=changed,
    )

    if is_image:
        log.screenshot.save(f"site_{site.id}_{log.id}.png", ContentFile(payload), save=True)
    else:
        log.text_content = payload
        log.save()

    if changed and last_log:
        context_label = "area crop" if site.monitor_type == "crop" else "halaman"

        if is_image and last_log.screenshot:
            try:
                old_bytes = last_log.screenshot.read()
                summary = _analyze_image_with_gemini(old_bytes, payload, site.url, context_label)
                if summary:
                    log.ai_summary = summary
                    log.save()
            except Exception as e:
                print(f"[Gemini] Gagal baca screenshot lama: {e}")

        elif not is_image and last_log.text_content:
            summary = _analyze_text_with_gemini(last_log.text_content, payload, site.url)
            if summary:
                log.ai_summary = summary
                log.save()

    if changed:
        _send_change_email(site, log)
        _send_change_telegram(site, log)


def _is_due(site, now):
    last_log = site.check_logs.first()

    if site.schedule_type == "interval":
        interval_minutes = site.schedule_value * UNIT_TO_MINUTES.get(site.schedule_unit, 60)
        if last_log is None:
            return True
        from datetime import timedelta
        return (now - last_log.checked_at) >= timedelta(minutes=interval_minutes)

    if not site.schedule_time:
        return False

    current_time = now.time()
    time_window_passed = current_time.hour == site.schedule_time.hour and current_time.minute == site.schedule_time.minute

    if not time_window_passed:
        return False

    already_checked_today = bool(
        last_log and last_log.checked_at.date() == now.date()
    )
    if already_checked_today:
        return False

    if site.schedule_type == "daily":
        return True

    if site.schedule_type == "custom_days":
        if last_log is None:
            return True
        days_since = (now.date() - last_log.checked_at.date()).days
        return days_since >= site.schedule_value

    if site.schedule_type == "weekly":
        today_code = WEEKDAY_MAP[now.weekday()]
        allowed_days = (site.schedule_days or "").split(",")
        return today_code in [d.strip() for d in allowed_days]

    return False


def run_due_checks():
    from django.utils import timezone

    now = timezone.localtime(timezone.now())
    sites = MonitoredSite.objects.filter(is_active=True)

    for site in sites:
        if _is_due(site, now):
            check_site(site.id)