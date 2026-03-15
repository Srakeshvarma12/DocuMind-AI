from django.db import models
from django.conf import settings

class Document(models.Model):
    STATUS_CHOICES = [
        ('uploading', 'Uploading'),
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]

    title = models.CharField(max_length=500)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    file_url = models.URLField()
    file_public_id = models.CharField(max_length=255, blank=True)
    file_type = models.CharField(max_length=10)
    file_size = models.IntegerField(default=0)
    extracted_text = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='uploading'
    )
    chroma_collection_id = models.CharField(max_length=255, blank=True)
    embeddings_data = models.JSONField(null=True, blank=True)
    page_count = models.IntegerField(default=0)
    word_count = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'documents'
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title
