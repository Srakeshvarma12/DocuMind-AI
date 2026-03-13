from django.urls import path
from . import views

urlpatterns = [
    path('<int:doc_id>/', views.ChatView.as_view(), name='chat'),
]
