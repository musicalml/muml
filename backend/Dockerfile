FROM python:3.6.5-alpine

WORKDIR /usr/src/app

ADD requirements.txt .

RUN apk add --update --virtual build-deps \
     gcc \
     python3-dev \
     musl-dev \
     g++ \
     libffi-dev \
  && apk add postgresql-dev \
  && pip install --no-cache-dir -r requirements.txt \
  && apk del build-deps

ADD run.sh /usr/bin/
RUN chmod +x /usr/bin/run.sh
