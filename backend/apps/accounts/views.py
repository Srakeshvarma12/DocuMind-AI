from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)


class VerifyTokenView(APIView):
    """
    Verify Firebase token and return user data.
    This endpoint is called after frontend Firebase auth to register/retrieve the user.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        from .firebase_auth import FirebaseAuthentication

        authenticator = FirebaseAuthentication()
        try:
            result = authenticator.authenticate(request)
            if result is None:
                return Response(
                    {'success': False, 'error': 'No authorization token provided', 'code': 'NO_TOKEN'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            user, _ = result
            serializer = UserSerializer(user)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Token verified successfully'
            })
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return Response(
                {'success': False, 'error': str(e), 'code': 'AUTH_FAILED'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserProfileView(APIView):
    """Get current user profile."""

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data
        })
