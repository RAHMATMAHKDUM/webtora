from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .telegram_link import generate_link_token


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def telegram_generate_link(request):
    link = generate_link_token(request.user)
    return Response({"link": link})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def telegram_status(request):
    profile = request.user.profile
    return Response({
        "connected": profile.telegram_verified,
        "phone_number": profile.telegram_phone_number,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def telegram_disconnect(request):
    profile = request.user.profile
    profile.telegram_chat_id = None
    profile.telegram_phone_number = None
    profile.telegram_verified = False
    profile.save()
    return Response({"message": "Telegram terputus."})