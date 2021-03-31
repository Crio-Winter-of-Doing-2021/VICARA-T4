from django.contrib.auth.models import User
from decouple import config
from django.db import IntegrityError

DJANGO_SU_NAME = config('DJANGO_SU_NAME')
DJANGO_SU_EMAIL = config('DJANGO_SU_EMAIL')
DJANGO_SU_PASSWORD = config('DJANGO_SU_PASSWORD')

try:
    superuser = User.objects.create_superuser(
        username=DJANGO_SU_NAME,
        email=DJANGO_SU_EMAIL,
        password=DJANGO_SU_PASSWORD)

    superuser.save()
except IntegrityError:
    print(f"Super User with username {DJANGO_SU_NAME} Already made ")
except Exception as e:
    print(e)
