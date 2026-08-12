from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MonitoredSite
from .monitoring_tasks import check_site


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MonitoredSite
from .monitoring_tasks import check_site


def _is_admin(request):
    return hasattr(request.user, "profile") and request.user.profile.role == "ADMIN"


def _get_site_with_access(request, site_id):
    try:
        site = MonitoredSite.objects.get(id=site_id)
    except MonitoredSite.DoesNotExist:
        return None

    if site.user_id == request.user.id or _is_admin(request):
        return site

    return None


def _serialize_check_log(log, request=None):
    screenshot_url = None
    if log.screenshot:
        try:
            screenshot_url = request.build_absolute_uri(log.screenshot.url) if request else log.screenshot.url
        except Exception:
            screenshot_url = None

    return {
        "id": log.id,
        "changed": log.changed,
        "checked_at": log.checked_at,
        "error": log.error,
        "ai_summary": log.ai_summary,
        "screenshot_url": screenshot_url,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def site_check_history(request, site_id):
    site = _get_site_with_access(request, site_id)
    if not site:
        return Response({"detail": "Situs tidak ditemukan."}, status=404)

    logs = site.check_logs.all()[:20]

    return Response({
        "results": [_serialize_check_log(l, request) for l in logs],
        "last_checked_at": logs[0].checked_at if logs else None,
        "last_changed": logs[0].changed if logs else None,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def site_check_now(request, site_id):
    site = _get_site_with_access(request, site_id)
    if not site:
        return Response({"detail": "Situs tidak ditemukan."}, status=404)

    check_site(site.id)

    latest_log = site.check_logs.first()

    if latest_log is None:
        return Response({"detail": "Gagal melakukan pengecekan."}, status=500)

    return Response(_serialize_check_log(latest_log, request))