# Dockerfile for machine learning container

FROM python:3.5

WORKDIR /app

RUN apt-get update 
RUN apt-get --assume-yes install apt-utils

COPY requirements.txt bin/build ./build/
RUN bash build/build.sh
RUN rm -rf build

