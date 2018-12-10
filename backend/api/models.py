from django.db import models
from django.contrib.postgres.fields import JSONField


# Create your models here.

class Midi(models.Model):
    # message format {time, [msg_num1, msg_num2, msg_num3]}
    name = models.CharField(max_length=100)
    messages = JSONField()


class MidiFilter(models.Model):
    filename = models.CharField(max_length=100)
    pitch_class_variability = models.FloatField(default=0)
    major_or_minor = models.FloatField(default=0)
    most_common_melodic_interval = models.FloatField(default=0)
    mean_melodic_interval = models.FloatField(default=0)
    amount_of_arpeggiation = models.FloatField(default=0)
    repeated_notes = models.FloatField(default=0)
    chromatic_motion = models.FloatField(default=0)
    melodic_thirds = models.FloatField(default=0)
    vertical_thirds = models.FloatField(default=0)
    mean_tempo = models.FloatField(default=0)
    duration_in_seconds = models.FloatField(default=0)
    note_density = models.FloatField(default=0)
