from django.core.paginator import Paginator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification


def _is_admin(request):
    return hasattr(request.user, "profile") and request.user.profile.role == "ADMIN"


def _serialize_notif(n):
    return {
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "target": n.target,
        "created_at": n.created_at,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_notifications_list(request):
    if not _is_admin(request):
        return Response({"detail": "Forbidden"}, status=403)

    qs = Notification.objects.all()

    page_number = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 20))

    paginator = Paginator(qs, page_size)
    page_obj = paginator.get_page(page_number)

    return Response({
        "results": [_serialize_notif(n) for n in page_obj],
        "count": paginator.count,
        "num_pages": paginator.num_pages,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_notifications_create(request):
    if not _is_admin(request):
        return Response({"detail": "Forbidden"}, status=403)

    data = request.data
    title = data.get("title")
    message = data.get("message")

    if not title or not message:
        return Response({"detail": "Judul dan pesan wajib diisi."}, status=400)

    notif = Notification.objects.create(
        title=title,
        message=message,
        type=data.get("type", "info"),
        target=data.get("target", "all"),
        created_by=request.user,
    )

    return Response(_serialize_notif(notif), status=201)