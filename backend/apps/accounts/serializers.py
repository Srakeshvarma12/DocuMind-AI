from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'firebase_uid', 'avatar_url', 'created_at']
        read_only_fields = ['id', 'firebase_uid', 'created_at']
