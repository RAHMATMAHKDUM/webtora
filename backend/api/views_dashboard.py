from datetime import timedelta

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MonitoredSite, SiteCheckLog


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    sites = MonitoredSite.objects.filter(user=request.user)
    total_sites = sites.count()
    active_sites = sites.filter(is_active=True).count()

    logs = SiteCheckLog.objects.filter(site__user=request.user)
    changes_found = logs.filter(changed=True).count()

    recent_logs = (
        logs.filter(changed=True)
        .select_related("site")
        .order_by("-checked_at")[:10]
    )

    recent_activity = [
        {
            "url": log.site.url,
            "checked_at": log.checked_at,
            "ai_summary": log.ai_summary,
        }
        for log in recent_logs
    ]

    chart = []
    for i in range(6, -1, -1):
        day = timezone.now().date() - timedelta(days=i)
        count = logs.filter(checked_at__date=day, changed=True).count()
        chart.append({"date": day.strftime("%d %b"), "changes": count})

    return Response({
        "total_sites": total_sites,
        "active_sites": active_sites,
        "changes_found": changes_found,
        "recent_activity": recent_activity,
        "chart": chart,
    })