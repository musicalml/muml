import os
from django.core.management import BaseCommand
from pathlib import Path
from mido import MidiFile
from midi.miscs import track_to_raw_list, purify_track
from api.models import Midi
from backend.settings import MIDI_IMPORT_PATH


class Command(BaseCommand):
    help = 'Fills db with midis'

    def handle(self, *args, **options):
        pathlist = Path(MIDI_IMPORT_PATH).glob('**/*.mid')
        for path in pathlist:
            # because path is object not string
            path_in_str = str(path)
            name = os.path.splitext(os.path.basename(path_in_str))[0]
            if Midi.objects.filter(name=name).count() > 0:
                continue
            print(name)
            try:
                mid = MidiFile(path_in_str)
                msgs = []
                for msg in mid:
                    msgs.append(msg)
                raw_list = track_to_raw_list(msgs)
                new_midi = Midi(name=name, messages=raw_list)
                new_midi.save()
            except Exception as e:
                print("Error in {}:".format(name), e)
