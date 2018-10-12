from api import views
from django.urls import path, include


urlpatterns = [
    path('track/', views.MidiList.as_view(), name='track'),
    path('track/<int:pk>/', views.MidiDetail.as_view(), name='track_detail'),
    path('track/<int:pk>/compare/', views.track_compare, name='compare_midisongs'),
    path(r'drf/', include('rest_framework.urls', namespace='rest_framework')),
]
