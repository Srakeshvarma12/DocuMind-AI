import os
import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth import get_user_model
import json
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

# Initialize Firebase Admin SDK
try:
    if not firebase_admin._apps:
        # Check for FIREBASE_CREDENTIALS environment variable first (Production/Railway)
        creds_json = os.environ.get('FIREBASE_CREDENTIALS')
        
        if creds_json:
            try:
                creds_dict = json.loads(creds_json)
                cred = credentials.Certificate(creds_dict)
                logger.info("Initializing Firebase using FIREBASE_CREDENTIALS env var")
            except Exception as e:
                logger.error(f"Failed to parse FIREBASE_CREDENTIALS: {str(e)}")
                raise e
        else:
            # Fallback to file-based (Local development)
            path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH', 
                                os.path.join(settings.BASE_DIR, 'firebase-service-account.json'))
            if os.path.exists(path):
                cred = credentials.Certificate(path)
                logger.info(f"Initializing Firebase using file: {path}")
            else:
                logger.warning(f"Firebase credentials not found (neither env var nor file at {path})")
                cred = None
        
        if cred:
            firebase_admin.initialize_app(cred)
except Exception as e:
    logger.error(f"Firebase initialization error: {str(e)}")

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            logger.debug("No Authorization header provided")
            return None

        id_token = auth_header.split(' ').pop()
        if not id_token:
            logger.debug("Empty token in Authorization header")
            return None
        
        # GUEST TOKEN BYPASS
        # If token is 'mock-token-admin', we bypass firebase (used for Guest Login)
        if id_token == 'mock-token-admin':
            user, _ = User.objects.get_or_create(
                username='guest@documind.ai',
                email='guest@documind.ai',
                defaults={'is_staff': False, 'is_superuser': False, 'first_name': 'Guest User'}
            )
            return (user, None)

        try:
            decoded_token = auth.verify_id_token(id_token)
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Invalid Firebase token: {str(e)}')

        if not decoded_token:
            return None

        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email')
        name = decoded_token.get('name', '')
        avatar_url = decoded_token.get('picture', '')

        user, created = User.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={
                'username': email,
                'email': email,
                'first_name': name,
                'avatar_url': avatar_url,
            }
        )

        return (user, None)
