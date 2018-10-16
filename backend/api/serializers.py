from api.models import Midi
from rest_framework import serializers


class MidiListSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Midi
        fields = ('id', 'name')


class MidiDetailSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Midi
        fields = ('id', 'name', 'messages')


class MidiInfoSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Midi
        fields = ('id', 'name')
