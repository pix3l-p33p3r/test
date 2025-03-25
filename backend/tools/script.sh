#!/bin/bash

sleep 1

# python3 manage.py makemigrations
# python3 manage.py makemigrations game
python3 manage.py migrate

exec "$@"
