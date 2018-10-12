#! /bin/sh
while [ ! -f /usr/lock/lock ]; do
    ls /usr/lock;
    sleep 1;
done;

mkdir -p /usr/src/app/spa/templates/
cp /usr/src/js/build/index.html /usr/src/app/spa/templates/

python manage.py collectstatic --noinput &&
python manage.py makemigrations &&
python manage.py migrate

exec gunicorn -w 2 -b :8080 backend.wsgi --reload
