from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UserProfile


def _is_admin(request):
    return hasattr(request.user, "profile") and request.user.profile.role == "ADMIN"


def _serialize_user(u):
    role = u.profile.role if hasattr(u, "profile") else "USER"
    return {
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "role": role,
        "is_active": u.is_active,
        "date_joined": u.date_joined,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    if not _is_admin(request):
        return Response({"detail": "Forbidden"}, status=403)

    qs = User.objects.select_related("profile").all().order_by("-date_joined")

    search = request.GET.get("search")
    if search:
        qs = qs.filter(Q(username__icontains=search) | Q(email__icontains=search))

    role = request.GET.get("role")
    if role:
        qs = qs.filter(profile__role=role)

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
        "results": [_serialize_user(u) for u in page_obj],
        "count": paginator.count,
        "num_pages": paginator.num_pages,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_users_create(request):
    if not _is_admin(request):
        return Response({"detail": "Forbidden"}, status=403)

    data = request.data
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not password:
        return Response({"detail": "Username dan password wajib diisi."}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"detail": "Username sudah dipakai."}, status=400)

    if email and User.objects.filter(email__iexact=email).exists():
        return Response({"detail": "Email sudah dipakai."}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email or "",
        password=password,
        is_active=data.get("is_active", True),
    )

    UserProfile.objects.update_or_create(
        user=user,
        defaults={"role": data.get("role", "USER")},
    )

    return Response(_serialize_user(user), status=201)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_users_update(request, user_id):
    if not _is_admin(request):
        return Response({"detail": "Forbidden"}, status=403)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User tidak ditemukan."}, status=404)

    data = request.data

    if "email" in data:
        user.email = data["email"]
    if "is_active" in data:
        user.is_active = data["is_active"]
    if data.get("password"):
        user.set_password(data["password"])
    user.save()

    if "role" in data:
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = data["role"]
        profile.save()

    return Response(_serialize_user(user))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def admin_users_delete(request, user_id):
    if not _is_admin(request):
        return Response({"detail": "Forbidden"}, status=403)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User tidak ditemukan."}, status=404)

    if hasattr(user, "profile") and user.profile.role == "ADMIN":
        return Response(
            {"detail": "Akun admin tidak bisa dihapus lewat panel. Hubungi developer/akses backend langsung."},
            status=403
        )

    user.delete()
    return Response(status=204)
