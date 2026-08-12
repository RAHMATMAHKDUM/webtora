from django.contrib import admin

from .models import (
    MonitoredSite,
    UserProfile
)

admin.site.register(MonitoredSite)
admin.site.register(UserProfile)