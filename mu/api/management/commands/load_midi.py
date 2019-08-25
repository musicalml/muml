import os
from django.core.management import BaseCommand
from mido import MidiFile
from midi.miscs import track_to_raw_list
from api.models import Midi


class Command(BaseCommand):
    help = 'Fills db with midis'

    def add_arguments(self, parser):
        parser.add_argument('path', type=str)

    def handle(self, *args, **options):
        path = options['path']
        name = os.path.splitext(os.path.basename(path))[0]
        print(name)
        try:
            mid = MidiFile(path)
            msgs = []
            for msg in mid:
                msgs.append(msg)
            raw_list = track_to_raw_list(msgs)
            new_midi = Midi(name=name, messages=raw_list)
            new_midi.save()
        except Exception as e:
            print("Error in {}:".format(name), e)
