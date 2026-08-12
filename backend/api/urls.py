from django.urls import path
from .views_admin import admin_dashboard, me
from .views_ai_helpers import describe_crop_area
from .views_admin_users import (
    admin_users_list,
    admin_users_create,
    admin_users_update,
    admin_users_delete,
)
from .views_admin_monitoring import (
    admin_monitoring_list,
    admin_monitoring_create,
    admin_monitoring_update,
    admin_monitoring_delete,
)
from .views import (
    RegisterView,
    MonitoredSiteListCreateView,
    MonitoredSiteDetailView,
    PreviewWebsiteView,
    ScreenshotView,
    GetSelectorView
)
from .views_email_verification import (
    verify_registration_code,
    resend_registration_code,
)
from .views_admin_notifications import (
    admin_notifications_list,
    admin_notifications_create,
)
from .views_monitoring_extra import site_check_history, site_check_now
from .views_notifications import notifications_list
from .views_password_reset import request_password_reset, confirm_password_reset
from .views_telegram import telegram_generate_link, telegram_status, telegram_disconnect
from .views_dashboard import user_dashboard
urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("register/verify/", verify_registration_code),
    path("register/resend-code/", resend_registration_code),
    path("sites/", MonitoredSiteListCreateView.as_view()),
    path("sites/<int:site_id>/", MonitoredSiteDetailView.as_view()),
    path("preview/", PreviewWebsiteView.as_view()),
    path("screenshot/", ScreenshotView.as_view()),
    path("get-selector/", GetSelectorView.as_view()),
    path("admin/dashboard/", admin_dashboard),
    path("me/", me),

    path("admin/users/", admin_users_list),
    path("admin/users/create/", admin_users_create),
    path("admin/users/<int:user_id>/", admin_users_update),
    path("admin/users/<int:user_id>/delete/", admin_users_delete),

    path("admin/monitoring/", admin_monitoring_list),
    path("admin/monitoring/create/", admin_monitoring_create),
    path("admin/monitoring/<int:site_id>/", admin_monitoring_update),
    path("admin/monitoring/<int:site_id>/delete/", admin_monitoring_delete),
    path("admin/notifications/", admin_notifications_list),
    path("admin/notifications/create/", admin_notifications_create),
    path("notifications/", notifications_list),
    path("password-reset/request/", request_password_reset),
    path("password-reset/confirm/", confirm_password_reset),
    path("sites/<int:site_id>/history/", site_check_history),
    path("sites/<int:site_id>/check-now/", site_check_now),
    path("telegram/generate-link/", telegram_generate_link),
    path("telegram/status/", telegram_status),
    path("telegram/disconnect/", telegram_disconnect),
    path("dashboard/", user_dashboard),
    path("describe-crop/", describe_crop_area),
]