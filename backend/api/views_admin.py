from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import Count
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    MonitoredSite,
    UserProfile,
)
@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == "GET":
        profile = request.user.profile
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": profile.role,
        })

    # PATCH — update email dan/atau password milik sendiri
    data = request.data
    user = request.user

    if "email" in data and data["email"]:
        if User.objects.filter(email__iexact=data["email"]).exclude(id=user.id).exists():
            return Response({"detail": "Email sudah dipakai."}, status=400)
        user.email = data["email"]

    if data.get("new_password"):
        old_password = data.get("old_password")
        if not old_password or not user.check_password(old_password):
            return Response({"detail": "Password lama salah."}, status=400)
        user.set_password(data["new_password"])

    user.save()

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.profile.role,
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):

    if request.user.profile.role != "ADMIN":
        return Response(
            {"detail": "Forbidden"},
            status=403
        )

    total_users = User.objects.count()

    admin_count = UserProfile.objects.filter(
        role="ADMIN"
    ).count()

    user_count = UserProfile.objects.filter(
        role="USER"
    ).count()

    total_sites = MonitoredSite.objects.count()

    active_sites = MonitoredSite.objects.filter(
        is_active=True
    ).count()

    inactive_sites = MonitoredSite.objects.filter(
        is_active=False
    ).count()

    latest_users = User.objects.order_by(
        "-date_joined"
    )[:5]

    latest_sites = (
        MonitoredSite.objects
        .select_related("user")
        .order_by("-created_at")[:5]
    )

    recent_activity = []

    for site in latest_sites:

        recent_activity.append({

            "type": "monitoring",

            "message":
                f"{site.user.username} menambahkan monitoring",

            "url": site.url,

            "time": site.created_at,

        })

    chart = []

    for i in range(6, -1, -1):

        day = timezone.now().date() - timedelta(days=i)

        total = MonitoredSite.objects.filter(
            created_at__date=day
        ).count()

        chart.append({

            "date": day.strftime("%d %b"),

            "monitoring": total

        })

    return Response({

        "stats": {

            "total_users": total_users,

            "admin_count": admin_count,

            "user_count": user_count,

            "total_sites": total_sites,

            "active_sites": active_sites,

            "inactive_sites": inactive_sites,

        },

        "latest_users": [

            {

                "id": u.id,

                "username": u.username,

                "email": u.email,

                "joined": u.date_joined,

            }

            for u in latest_users

        ],

        "latest_sites": [

            {

                "id": s.id,

                "url": s.url,

                "user": s.user.username,

                "active": s.is_active,

                "created": s.created_at,

            }

            for s in latest_sites

        ],

        "recent_activity": recent_activity,

        "chart": chart,

    })