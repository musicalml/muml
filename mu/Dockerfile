FROM python:3.6.5
ENV PYTHONUNBUFFERED=TRUE

WORKDIR /var/www/backend/

RUN apt-get update
RUN apt-get -y install \
     gcc \
     g++ \
     libffi-dev

RUN pip install --upgrade pip
ADD requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
ADD . .

EXPOSE 8080

CMD ["gunicorn", "-w", "2", "-b", ":8080", "backend.wsgi", "--reload"]
