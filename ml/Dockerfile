# Dockerfile for machine learning container

FROM python:3.5

WORKDIR /app

COPY requirements.txt bin/build ./build/
RUN bash build/build.sh
RUN rm -rf build

