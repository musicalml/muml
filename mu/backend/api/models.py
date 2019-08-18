from django.db import models
from django.contrib.postgres.fields import JSONField


class Midi(models.Model):
    # message format {time, [msg_num1, msg_num2, msg_num3]}
    name = models.CharField(max_length=100)
    messages = JSONField()
