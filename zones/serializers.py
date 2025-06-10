from rest_framework import serializers
from .models import DogZoneReport

class DogZoneReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DogZoneReport
        fields = '__all__'
