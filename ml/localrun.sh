#! /bin/bash

sudo docker run \
	-it \
	--rm \
	-v `pwd`:/app/ml \
	muml_ml /bin/bash

