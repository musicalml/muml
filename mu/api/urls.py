from api import views
from django.urls import path, include


urlpatterns = [
    path('csrf_token/', views.csrf_token, name='csrf_token'),
    path('track/', views.MidiList.as_view(), name='track'),
    path('track/<int:pk>/', views.MidiInfo.as_view(), name='track_info'),
    path('track/<int:pk>/midi/', views.MidiDetail.as_view(), name='track_detail'),
    path('track/<int:pk>/compare/', views.track_compare, name='compare_midisongs'),
    path('track/<int:pk>/chords/', views.track_chords, name='track_chord'),
    path('track/<int:pk>/notes/', views.track_notes, name='track_notes'),
    path(r'drf/', include('rest_framework.urls', namespace='rest_framework')),
    path('load_midi/', views.MidiUploadView.as_view(), name='load_midi')
]
