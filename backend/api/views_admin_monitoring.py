from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MonitoredSite


def _is_admin(request):
    return hasattr(request.user, "profile") and request.user.profile.role == "ADMIN"


UNIT_TO_MINUTES = {"minute": 1, "hour": 60, "day": 1440}


def _to_minutes(value, unit):
    return value * UNIT_TO_MINUTES.get(unit, 1)


def _serialize_site(s):
    return {
        "id": s.id,
        "url": s.url,
        "user": s.user.username,
        "mode": s.monitor_type,
        "check_interval_minutes": _to_minutes(s.schedule_value, s.schedule_unit) if s.schedule_type == "interval" else None,
        "is_active": s.is_active,
        "created": s.created_at,
        "notify_email": s.notify_email,
        "email_target": s.email_target,
        "notify_telegram": s.notify_telegram,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_monitoring_list(request):
    if not _is_admin(request):
        return Response({"detail": "Forbidden"}, status=403)

    qs = MonitoredSite.objects.select_related("user").all().order_by("-created_at")

    search = request.GET.get("search")
    if search:
        qs = qs.filter(Q(url__icontains=search) | Q(user__username__icontains=search))

    status_param = request.GET.get("status")
    if status_param == "active":
        qs = qs.filter(is_active=True)
    elif status_param == "inactive":
        qs = qs.filter(is_active=False)

    page_number = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 10))

    paginator = Paginator(qs, page_size)
    page_obj = paginator.get_page(page_number)

    return Response({
        "results": [_serialize_site(s) for s in page_obj],
        "count": paginator.count,
        "num_pages": paginator.num_pages,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_monitoring_create(request):
    if not _is_admin(request):
        return Response({"detail": "Forbidden"}, status=403)

    data = request.data
    username = data.get("username")
    url = data.get("url")

    if not username or not url:
        return Response({"detail": "Username dan URL wajib diisi."}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"detail": "Pengguna tidak ditemukan."}, status=400)

    site = MonitoredSite.objects.create(
        user=user,
        url=url,
        monitor_type=data.get("mode", "selector"),
        schedule_value=data.get("schedule_value", 1),
        schedule_unit=data.get("schedule_unit", "hour"),
        is_active=data.get("is_active", True),
    )

    return Response(_serialize_site(site), status=201)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_monitoring_update(request, site_id):
    if not _is_admin(request):
        return Response({"detail": "Forbidden"}, status=403)

    try:
        site = MonitoredSite.objects.get(id=site_id)
    except MonitoredSite.DoesNotExist:
        return Response({"detail": "Target monitoring tidak ditemukan."}, status=404)

    data = request.data

    if "url" in data:
        site.url = data["url"]
    if "mode" in data:
        site.monitor_type = data["mode"]
    if "schedule_value" in data:
        site.schedule_value = data["schedule_value"]
    if "schedule_unit" in data:
        site.schedule_unit = data["schedule_unit"]
    if "is_active" in data:
        site.is_active = data["is_active"]

    site.save()
    return Response(_serialize_site(site))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def admin_monitoring_delete(request, site_id):
    if not _is_admin(request):
        return Response({"detail": "Forbidden"}, status=403)

    try:
        site = MonitoredSite.objects.get(id=site_id)
    except MonitoredSite.DoesNotExist:
        return Response({"detail": "Target monitoring tidak ditemukan."}, status=404)

    site.delete()
    return Response(status=204)