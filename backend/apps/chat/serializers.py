from rest_framework import serializers
from .models import ChatSession, ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'source_pages', 'created_at']

class SendMessageSerializer(serializers.Serializer):
    message = serializers.CharField(required=True)
