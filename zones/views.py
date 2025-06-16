# views.py
from rest_framework import viewsets, views
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import DogZoneReport
from .serializers import DogZoneReportSerializer

class DogZoneReportViewSet(viewsets.ModelViewSet):
    queryset = DogZoneReport.objects.all()
    serializer_class = DogZoneReportSerializer

    @action(detail=True, methods=['post'])

    def upvote(self, request, pk=None):
        report = self.get_object()
        report.upvotes += 1
        report.save()
        return Response({'upvotes': report.upvotes})

    @action(detail=True, methods=['post'])

    def downvote(self, request, pk=None):
        report = self.get_object()
        report.downvotes += 1
        report.save()
        return Response({'downvotes': report.downvotes})
