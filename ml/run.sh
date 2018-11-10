#! /bin/bash

python3 src/check_dependences.py \
    & python3 src/midi_feature_extraction/migrate.py \
    & python3 src/server/run.py
