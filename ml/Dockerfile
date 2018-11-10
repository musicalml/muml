# Dockerfile for machine learning container

FROM python:3.5

WORKDIR /app
COPY requirements.txt build.sh ./build/
ENV PYTHONUNBUFFERED=1

RUN apt-get update 
RUN apt-get --assume-yes install apt-utils
RUN apt-get --assume-yes install default-jre \
                                 postgresql postgresql-contrib \
                                 unzip

RUN pip3 install --upgrade pip
RUN pip3 install --no-cache-dir -r build/requirements.txt

RUN bash build/build.sh
RUN rm -rf build

EXPOSE 9000