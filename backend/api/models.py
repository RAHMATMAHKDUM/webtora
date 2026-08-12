import random
import uuid
from datetime import timedelta

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from .fields import EncryptedTextField


class MonitoredSite(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    url = models.URLField()

    monitor_type = models.CharField(
        max_length=20,
        default="selector"
    )

    css_selector = models.TextField(
        blank=True,
        null=True
    )

    selected_text = models.TextField(
        blank=True,
        null=True
    )

    crop_x = models.IntegerField(
        null=True,
        blank=True
    )

    crop_y = models.IntegerField(
        null=True,
        blank=True
    )

    crop_width = models.IntegerField(
        null=True,
        blank=True
    )

    crop_height = models.IntegerField(
        null=True,
        blank=True
    )

    schedule_value = models.IntegerField(
        default=1,
        null=True,
        blank=True
    )

    schedule_unit = models.CharField(
        max_length=20,
        default="hour",
        null=True,
        blank=True
    )
    SCHEDULE_TYPE_CHOICES = (
        ("interval", "Interval (setiap X menit/jam)"),
        ("daily", "Harian (jam tertentu)"),
        ("custom_days", "Setiap N Hari (jam tertentu)"),
        ("weekly", "Mingguan (hari + jam tertentu)"),
    )

    schedule_type = models.CharField(
        max_length=20,
        choices=SCHEDULE_TYPE_CHOICES,
        default="interval"
    )

    schedule_time = models.TimeField(
        blank=True,
        null=True
    )

    schedule_days = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )  # contoh: "mon,wed,fri" — dipakai kalau schedule_type == "weekly"

    notify_email = models.BooleanField(
        default=True
    )

    notify_telegram = models.BooleanField(
        default=False
    )

    email_target = models.EmailField(
        blank=True,
        null=True
    )

    telegram_chat_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )


class UserProfile(models.Model):

    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("USER", "User"),
    )

    THEME_CHOICES = (
        ("light", "Light"),
        ("dark", "Dark"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="USER"
    )

    theme = models.CharField(
        max_length=10,
        choices=THEME_CHOICES,
        default="light"
    )

    telegram_chat_id = EncryptedTextField(
        blank=True,
        null=True
    )
    telegram_phone_number = models.CharField(
        max_length=30,
        blank=True,
        null=True
    )

    telegram_verified = models.BooleanField(
        default=False
    )

    email_verified = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.username


class Notification(models.Model):

    TYPE_CHOICES = (
        ("info", "Info"),
        ("success", "Success"),
        ("warning", "Warning"),
        ("error", "Error"),
    )

    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="info")
    target = models.CharField(max_length=20, default="all")

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="notifications_sent"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.used and (timezone.now() - self.created_at) < timedelta(minutes=15)

    @staticmethod
    def generate_code():
        return str(random.randint(100000, 999999))


class EmailVerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.used and (timezone.now() - self.created_at) < timedelta(minutes=15)

    @staticmethod
    def generate_code():
        return str(random.randint(100000, 999999))


class SiteCheckLog(models.Model):
    site = models.ForeignKey(
        MonitoredSite,
        on_delete=models.CASCADE,
        related_name="check_logs"
    )
    content_hash = models.CharField(max_length=64, blank=True, null=True)
    changed = models.BooleanField(default=False)
    checked_at = models.DateTimeField(auto_now_add=True)
    error = models.TextField(blank=True, null=True)
    screenshot = models.FileField(upload_to="snapshots/", blank=True, null=True)
    ai_summary = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-checked_at"]


class TelegramLinkToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=32, unique=True)
    chat_id = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)


class TelegramPollState(models.Model):
    last_update_id = models.BigIntegerField(default=0)


class ActiveSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="active_sessions")
    session_id = models.CharField(max_length=64, unique=True, default=uuid.uuid4)
    device_info = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]