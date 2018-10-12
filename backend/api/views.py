from api.models import Midi
from rest_framework import viewsets
from api.serializers import MidiListSerializer


class MidiViewSet(viewsets.ModelViewSet):
    """
    API endpoint that lists midis
    """
    queryset = Midi.objects.all()
    serializer_class = MidiListSerializer
