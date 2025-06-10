from rest_framework import generics
from .models import DogZoneReport
from .serializers import DogZoneReportSerializer


class DogZoneReportListCreateView(generics.ListCreateAPIView):
    queryset = DogZoneReport.objects.all()
    serializer_class = DogZoneReportSerializer
