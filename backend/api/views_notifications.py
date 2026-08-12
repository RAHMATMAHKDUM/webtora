from django.core.paginator import Paginator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification


def _serialize_notif(n):
    return {
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "created_at": n.created_at,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    qs = Notification.objects.filter(target="all")

    page_number = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 20))

    paginator = Paginator(qs, page_size)
    page_obj = paginator.get_page(page_number)

    return Response({
        "results": [_serialize_notif(n) for n in page_obj],
        "count": paginator.count,
        "num_pages": paginator.num_pages,
    })