FROM node as builder

COPY frontend /usr/src/js

WORKDIR /usr/src/js
RUN yarn && yarn build

FROM python:3.6.5

COPY --from=builder /usr/src/js/build/ /usr/src/js/build/

WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get -y install \
     gcc \
     g++ \
     libffi-dev

ADD backend .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080

CMD ["gunicorn", "-w", "2", "-b", ":8080", "backend.wsgi", "--reload"]
