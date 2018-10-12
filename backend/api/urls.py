from rest_framework import routers
from api import views
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'track', views.MidiViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path(r'', include(router.urls)),
    path(r'drf/', include('rest_framework.urls', namespace='rest_framework')),
]
