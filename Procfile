release: python manage.py makemigrations --no-input
release: python manage.py migrate --no-input
release: python manage.py migrate --run-syncdb --no-input
web: gunicorn mysite.wsgi --log-file -