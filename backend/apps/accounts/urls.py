from django.urls import path
from . import views

urlpatterns = [
    path('verify/', views.VerifyTokenView.as_view(), name='verify-token'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
]
