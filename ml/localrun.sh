#! /bin/bash

sudo docker run \
	-it \
	--rm \
	-v `pwd`:/app/ml \
	ml /bin/bash

