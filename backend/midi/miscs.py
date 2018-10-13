from scipy.optimize import linear_sum_assignment
from numpy import empty
from mido import Message
from copy import deepcopy

INF_DIST = 100


def chords_distance(a, b):
    if len(a) > len(b):
        a, b = b, a

    n = max(len(a), len(b))
    C = empty([n, n])  # Assignment problem matrix
    for i in range(n):
        for j in range(n):
            C[i, j] = abs(a[i] - b[j]) if i < len(a) else INF_DIST

    res_x, res_y = linear_sum_assignment(C)  # res_x[i] is assigned to res_y[i]
    dist = 0  # answer
    m = 0  # median of a chord * len(b)-len(a)
    for i in range(len(a)):
        dist += abs(a[res_x[i]] - b[res_y[i]])
        m += a[res_x[i]]
    m *= (len(b) - len(a)) / len(a)
    left_sum = 0
    for i in range(len(a), len(b)):
        left_sum += b[res_y[i]]
    dist += abs(left_sum - m)

    return dist


def msg_to_raw(msg, num=0):
    raw = [144, msg.note, msg.velocity if msg.type == 'note_on' else 0, round(msg.time * 1000), num]
    return raw


def raw_to_msg(raw):
    msg = Message('note_on' if raw[2] > 0 else 'note_off')
    msg.note = raw[1]
    msg.velocity = raw[2]
    msg.time = raw[3] / 1000
    msg.channel = raw[4]
    return msg


def track_to_raw_list(track, num=0):
    raw_list = [msg_to_raw(x, num) for x in track]
    return raw_list


def raw_list_to_track(raw_list):
    track = [raw_to_msg(x) for x in raw_list]
    return track


def purify_track(track):
    new_track = []
    for msg in track:
        if msg.type in ['note_on', 'note_off']:
            new_track.append(deepcopy(msg))
    return new_track


def diff_to_times(raw_list):
    new_raw_list = deepcopy(raw_list)
    for i in range(1, len(new_raw_list)):
        new_raw_list[i][3] += new_raw_list[i - 1][3]
    return new_raw_list


def times_to_diff(raw_list):
    new_raw_list = []
    last = 0
    for x in raw_list:
        t = deepcopy(x)
        t[3] -= last
        last = x[3]
        new_raw_list.append(t)
    return new_raw_list
