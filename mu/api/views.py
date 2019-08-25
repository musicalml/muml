from api.models import Midi
from api.serializers import MidiListSerializer, MidiDetailSerializer, MidiInfoSerializer
from django.views.decorators.http import require_http_methods
from django.middleware.csrf import get_token
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView

from midi.miscs import raw_list_to_track
from midi.midisong import MidiSong, list_note_nums
from midi.comparison import compare_midisongs

from django.core.management import call_command

class MidiList(generics.ListCreateAPIView):
    serializer_class = MidiListSerializer

    def get_queryset(self):
        queryset = Midi.objects.all()

        return queryset


class MidiDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Midi.objects.all()
    serializer_class = MidiDetailSerializer


class MidiInfo(generics.RetrieveUpdateDestroyAPIView):
    queryset = Midi.objects.all()
    serializer_class = MidiInfoSerializer


@api_view(['GET'])
def csrf_token(request):
    return Response({"csrf_token": get_token(request)})

@api_view(['POST'])
def track_compare(request, pk):
    raw_list = request.data['notes']
    for i in range(1, len(raw_list)):
        raw_list[i][-1] -= raw_list[0][-1]
    raw_list[0][-1] = 0
    test_song = MidiSong(raw_list_to_track(raw_list))
    try:
        original = Midi.objects.get(id=pk)
    except Midi.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    original_song = MidiSong(raw_list_to_track(original.messages))
    score, full, song_played = compare_midisongs(original_song, test_song)
    response = {'grade': score / full, 'song_played': song_played}
    return Response(response)


@api_view(['GET'])
def track_chords(request, pk):
    try:
        original = Midi.objects.get(id=pk)
    except Midi.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    original_song = MidiSong(raw_list_to_track(original.messages))
    chords = []
    for chord in original_song.chords:
        chords.append({'notes': list_note_nums(chord.notes), 'time': chord.time})
    return Response(chords)


@api_view(['GET'])
def track_notes(request, pk):
    try:
        original = Midi.objects.get(id=pk)
    except Midi.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    original_song = MidiSong(raw_list_to_track(original.messages))
    notes = []
    for note in original_song.notes:
        notes.append([note.note, note.time, note.time + note.duration, note.duration])
    return Response(notes)

class MidiUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, format=None):

        file = request.data['files']
        name = file.name
        path = '/tmp/{}.mid'.format(name)
        with open(path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        call_command('load_midi', path)
        return Response('ok')
