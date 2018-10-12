from django.core.management import BaseCommand
from pathlib import Path
from mido import MidiFile
from midi.miscs import track_to_raw_list, purify_track
from api.models import Midi


class Command(BaseCommand):
    help = 'Fills db with midis from given path (recursively)'

    def add_arguments(self, parser):
        parser.add_argument('path', type=str)

    def handle(self, *args, **options):
        path = options['path']
        pathlist = Path(path).glob('**/*.mid')
        for path in pathlist:
            # because path is object not string
            path_in_str = str(path)
            name = ( '.'.join(path_in_str.split('.')[:-1]) ).split('/')[-1]
            try:
                mid = MidiFile(path_in_str)
                for i, track in enumerate(mid.tracks):
                    raw_list = track_to_raw_list(purify_track(track))
                    if len(raw_list) > 0:
                        track_name = name if i == 0 else name + " Track {}".format(i + 1)
                        print(track_name)
                        new_midi = Midi(name=track_name, messages=raw_list)
                        new_midi.save()
            except Exception as e:
                print("Error in {}:".format(name), e)
