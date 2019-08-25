FROM python:3.6.5
ENV PYTHONUNBUFFERED=TRUE

WORKDIR /var/www/backend/

RUN apt-get update
RUN apt-get -y install \
     gcc \
     g++ \
     libffi-dev

ADD . .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080

CMD ["gunicorn", "-w", "2", "-b", ":8080", "backend.wsgi", "--reload"]
