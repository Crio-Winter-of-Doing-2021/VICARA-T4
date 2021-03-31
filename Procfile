release: python manage.py makemigrations --no-input
release: python manage.py migrate --no-input
release: python manage.py migrate --run-syncdb --no-input
release: python manage.py shell < mysite/create_super_user.py 
web: gunicorn mysite.wsgi --log-file -