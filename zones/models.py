from django.db import models

class DogZoneReport(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    location = models.CharField(max_length=200)
    description = models.TextField()
    date_time = models.DateTimeField(auto_now_add=True)
    photo = models.ImageField(upload_to='incident_photos/', blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)   # ✅ NEW
    longitude = models.FloatField(null=True, blank=True) 
    upvotes = models.IntegerField(default=0)
    downvotes = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} - {self.location}"
