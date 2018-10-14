# Dockerfile for machine learning container

FROM python:3.5

WORKDIR /app

COPY requirements.txt bin/build.sh ./
RUN chmod +x build.sh
RUN ./build.sh
RUN rm build.sh requirements.txt

