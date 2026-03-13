from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'file_type', 'page_count', 'word_count', 'uploaded_at')
    list_filter = ('status', 'file_type', 'uploaded_at')
    search_fields = ('title', 'user__email')
    readonly_fields = ('uploaded_at', 'processed_at')
