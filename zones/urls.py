from rest_framework import routers
from .views import DogZoneReportViewSet

router = routers.DefaultRouter()
router.register(r'reports', DogZoneReportViewSet)

urlpatterns = router.urls
