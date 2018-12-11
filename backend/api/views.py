from api.models import Midi, MidiFilter
from api.serializers import MidiListSerializer, MidiDetailSerializer, MidiInfoSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from midi.miscs import raw_list_to_track
from midi.midisong import MidiSong, list_note_nums
from midi.comparison import compare_midisongs

FILTER_LONG_SHORT = {'nd': 'note_density',
                     'pcv': 'pitch_class_variability',
                     'mom': 'major_or_minor',
                     'mcmi': 'most_common_melodic_interval',
                     'mmi': 'mean_melodic_interval',
                     'aoa': 'amount_of_arpeggiation',
                     'rn': 'repeated_notes',
                     'cm': 'chromatic_motion',
                     'mthirds': 'melodic_thirds',
                     'vt': 'vertical_thirds',
                     'mtemp': 'mean_tempo',
                     'dis': 'duration_in_seconds',
                     }


class MidiList(generics.ListCreateAPIView):
    serializer_class = MidiListSerializer

    def get_queryset(self):
        queryset = Midi.objects.all()

        query_orders = self.request.query_params.getlist('f', [])
        formatted_orders = []
        for i in range(len(query_orders)):
            prefix = ''
            main = ''
            if query_orders[i][0] == '-':
                prefix = '-'
                main = FILTER_LONG_SHORT.get(query_orders[i][1:], None)
            else:
                main = FILTER_LONG_SHORT.get(query_orders[i], None)
            if main is None:
                continue
            formatted_orders.append(prefix + 'filter__' + main)
        print(formatted_orders)
        queryset = queryset.order_by(*formatted_orders)
        return queryset


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
