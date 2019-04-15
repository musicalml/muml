CHORD_DIFFICULTY_SCALE = 5
TIME_DIFF_IGNORE_GAP = 0.2
TIME_DIFF_WEIGHT = 10
EXTRA_KEYS_WEIGHT = 2


def time_diff_metric(time1, time2):
    diff = abs(time1 - time2)
    if diff < TIME_DIFF_IGNORE_GAP:
        return 0
    else:
        return (diff - TIME_DIFF_IGNORE_GAP) ** 2 / 4


def compare_midisongs(original, tested):
    """
    Original, tested: MidiSong format
    """
    score = 0  # played score
    full = 0  # perfect score
    i = 0  # chord iterator
    j = 0  # tested track iterator
    while i < len(original.chords):
        difficulty = 1 + original.chords[i].difficulty // CHORD_DIFFICULTY_SCALE
        full += difficulty

        plan = {}
        for note in original.chords[i].notes:
            plan[note.note] = False
        original_time = original.chords[i].time - original.chords[i - 1].time if i > 0 else tested.track[0].time

        counter = 0
        keys_pressed = 0
        n = len(original.chords[i].notes)
        tested_time = 0

        while counter < n and j < len(tested.track):
            msg = tested.track[j]
            tested_time += msg.time
            if msg.type == 'note_on':
                keys_pressed += 1
                if msg.note in plan and not plan[msg.note]:
                    counter += 1
                    plan[msg.note] = True
            elif msg.type == 'note_off':
                if msg.note in plan and plan[msg.note]:
                    counter -= 1
                    plan[msg.note] = False
            else:
                pass
            j += 1
        if j >= len(tested.track) and counter < n:
            break
        error = (1 / (1 + EXTRA_KEYS_WEIGHT * abs(keys_pressed - n) + TIME_DIFF_WEIGHT * abs(
            time_diff_metric(tested_time, original_time))))
        score += difficulty * error
        original.chords[i].quality = error
        i += 1
    return score, full, i / len(original.chords)
