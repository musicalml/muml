FROM python:3.6.5

WORKDIR /usr/src/app

ADD requirements.txt .

RUN apt-get update
RUN apt-get -y install \
     gcc \
     #python3-dev \
     #musl-dev \
     g++ \
     libffi-dev \
     #libblas-dev \
     #liblapack-dev \
     #libatlas-base-dev \
     #gfortran \
     && echo "apt-get finished"
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

ADD run.sh /usr/bin/
RUN chmod +x /usr/bin/run.sh
