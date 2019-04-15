API Description

 - <midi_filename>/rawfeature/<feature_name> - return scpecified feature for scpecified midi file
 - manage/update_midifeatures - extract features from new files in "midi_import"

To update features manually, do `docker-compose exec ml python3 src/midi_feature_extraction/migrate.py`
