from django.urls import path
from .views import DogZoneReportListCreateView

urlpatterns = [
    path('reports/', DogZoneReportListCreateView.as_view(), name='report'),
]
