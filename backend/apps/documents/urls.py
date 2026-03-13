from django.urls import path
from . import views

urlpatterns = [
    path('', views.DocumentListView.as_view(), name='document-list'),
    path('upload/', views.DocumentUploadView.as_view(), name='document-upload'),
    path('<int:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    path('<int:pk>/status/', views.DocumentStatusView.as_view(), name='document-status'),
    path('<int:pk>/summary/', views.DocumentSummaryView.as_view(), name='document-summary'),
]
