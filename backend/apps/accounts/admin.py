from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'firebase_uid', 'created_at', 'is_active')
    search_fields = ('email', 'firebase_uid')
    list_filter = ('is_active', 'created_at')
