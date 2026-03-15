#!/bin/bash
echo "Running migrations..."
python manage.py migrate
echo "Starting Celery worker..."
celery -A documind worker --loglevel=info --pool=solo --detach
echo "Starting Gunicorn..."
exec gunicorn documind.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
