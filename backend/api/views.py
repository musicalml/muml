from api.models import Midi
from api.serializers import MidiListSerializer, MidiDetailSerializer, MidiInfoSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from midi.miscs import raw_list_to_track
from midi.midisong import MidiSong, list_note_nums
from midi.comparison import compare_midisongs


class MidiList(generics.ListCreateAPIView):
    queryset = Midi.objects.all()
    serializer_class = MidiListSerializer


class MidiDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Midi.objects.all()
    serializer_class = MidiDetailSerializer


class MidiInfo(generics.RetrieveUpdateDestroyAPIView):
    queryset = Midi.objects.all()
    serializer_class = MidiInfoSerializer


@api_view(['POST'])
def track_compare(request, pk):
    raw_list = request.data['notes']
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
