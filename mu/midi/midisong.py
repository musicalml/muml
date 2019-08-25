from copy import deepcopy
from midi.miscs import chords_distance

CHORD_EPSILON = 0.05


class Note:
    def __init__(self, note=0, velocity=64, time=0, duration=0, channel=0):
        self.note = note  # piano note
        self.velocity = velocity
        self.time = time
        self.duration = duration
        self.channel = channel
        self.chord = 0


def list_note_nums(notes):
    l = []
    for note in notes:
        l.append(note.note)
    return l


class Chord:
    def __init__(self, time=0, notes=None, difficulty=0):
        if notes is None:
            notes = list()
        self.time = time
        self.notes = notes
        self.difficulty = difficulty
        self.quality = 1


class MidiSong:
    def __init__(self, track):
        self.track = track
        self.notes = list()
        self.chords = list()
        self.length = 0

        self._build_midisong()
        self._divide_into_chords()

    def _build_midisong(self):
        draft = dict()
        cur_time = 0
        for msg in self.track:
            cur_time += msg.time
            if msg.type == 'note_on' and msg.velocity > 0:
                new_note = Note(msg.note, msg.velocity, cur_time, channel=msg.channel)
                draft[msg.note] = new_note
            elif msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
                if msg.note in draft:
                    draft[msg.note].duration = cur_time - draft[msg.note].time
                    self.notes.append(draft.pop(msg.note))
            else:
                continue
        self.notes.sort(key=lambda x: x.time)
        self.length = cur_time

    def _divide_into_chords(self):
        i = 0
        while i < len(self.notes):
            step_time = self.notes[i].time
            step_notes = []
            while i < len(self.notes) and self.notes[i].time - step_time < CHORD_EPSILON:
                step_notes.append(self.notes[i])
                self.notes[i].chord = len(self.chords)
                i += 1
            if len(self.chords) != 0:
                difficulty = chords_distance(list_note_nums(step_notes),
                                             list_note_nums(self.chords[-1].notes))
            else:
                difficulty = 0
            self.chords.append(Chord(time=step_time, notes=step_notes, difficulty=difficulty))
