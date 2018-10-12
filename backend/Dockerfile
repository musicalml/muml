FROM python:3.6.5

WORKDIR /usr/src/app


RUN apt-get update
RUN apt-get -y install \
     gcc \
     g++ \
     libffi-dev


ADD requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

ADD run.sh /usr/bin/
RUN chmod +x /usr/bin/run.sh
