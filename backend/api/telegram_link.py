import secrets
import requests
from django.conf import settings

from .models import TelegramLinkToken, TelegramPollState


def generate_link_token(user):
    token = secrets.token_urlsafe(16)
    TelegramLinkToken.objects.create(user=user, token=token)
    return f"https://t.me/{settings.TELEGRAM_BOT_USERNAME}?start={token}"


def poll_telegram_updates():
    if not settings.TELEGRAM_BOT_TOKEN:
        return

    state, _ = TelegramPollState.objects.get_or_create(id=1)

    try:
        resp = requests.get(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getUpdates",
            params={"offset": state.last_update_id + 1, "timeout": 0},
            timeout=10,
        )
        data = resp.json()
    except Exception as e:
        print(f"[TelegramPoll] Error fetch updates: {e}")
        return

    if not data.get("ok"):
        return

    for update in data.get("result", []):
        state.last_update_id = update["update_id"]
        message = update.get("message")
        if not message:
            continue

        chat_id = message["chat"]["id"]
        text = message.get("text", "") or ""
        contact = message.get("contact")

        if text.startswith("/start "):
            token = text.split(" ", 1)[1].strip()
            try:
                link = TelegramLinkToken.objects.get(token=token, used=False)
            except TelegramLinkToken.DoesNotExist:
                continue

            profile = link.user.profile
            profile.telegram_chat_id = str(chat_id)
            profile.telegram_verified = True
            profile.save()

            link.used = True
            link.chat_id = str(chat_id)
            link.save()

            try:
                requests.post(
                    f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
                    json={
                        "chat_id": chat_id,
                        "text": (
                            "✅ Akun Telegram kamu berhasil terhubung!\n"
                            "✅ Your Telegram account is now connected!\n\n"
                            "Opsional: ketuk tombol di bawah untuk berbagi nomor telepon (ditampilkan di dashboard sebagai konfirmasi).\n"
                            "Optional: tap the button below to share your phone number (shown on your dashboard as confirmation)."
                        ),
                        "reply_markup": {
                            "keyboard": [[{"text": "📱 Share Kontak / Share Contact", "request_contact": True}]],
                            "resize_keyboard": True,
                            "one_time_keyboard": True,
                        },
                    },
                    timeout=10,
                )
            except Exception as e:
                print(f"[TelegramPoll] Error sending welcome message: {e}")

        elif contact:
            phone = contact.get("phone_number")
            link = (
                TelegramLinkToken.objects
                .filter(chat_id=str(chat_id), used=True)
                .order_by("-created_at")
                .first()
            )
            if link:
                profile = link.user.profile
                profile.telegram_phone_number = phone
                profile.save()

    state.save()