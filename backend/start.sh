#!/bin/bash
echo "Running migrations..."
python manage.py migrate
echo "Migrations complete. Starting gunicorn..."
exec gunicorn documind.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
