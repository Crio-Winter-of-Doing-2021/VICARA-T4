from django.core.mail import EmailMessage
import re
from mysite.settings import LOCAL_SERVER, PROD_SERVER
email_regex = '^(\w|\.|\_|\-)+[@](\w|\_|\-|\.)+[.]\w{2,3}$'


def is_valid_email(email):
    return re.search(email_regex, email)


def sendMail(title, body, to):
    email = EmailMessage(title, body, to=to)
    email.send()


def get_server(request):
    server = request.META.get('wsgi.file_wrapper', None)
    if server is not None and server.__module__ == 'django.core.servers.basehttp':
        return LOCAL_SERVER
    else:
        return PROD_SERVER
