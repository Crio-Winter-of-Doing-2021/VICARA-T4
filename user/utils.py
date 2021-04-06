from django.core.mail import EmailMessage
import re
from mysite.settings import LOCAL_SERVER, PROD_SERVER, LOCAL_CLIENT, PROD_CLIENT
email_regex = '^(\w|\.|\_|\-)+[@](\w|\_|\-|\.)+[.]\w{2,3}$'


def is_valid_email(email):
    return re.search(email_regex, email)


def sendMail(title, body, to):
    email = EmailMessage(title, body, to=to)
    email.send()


def get_client_server(request):
    server = request.META.get('wsgi.file_wrapper', None)
    data = {}
    if server is not None and server.__module__ == 'django.core.servers.basehttp':
        data["client"] = LOCAL_CLIENT
        data["server"] = LOCAL_SERVER
    else:
        data["client"] = PROD_CLIENT
        data["server"] = PROD_SERVER
    return data


def get_path(start_node):
    path = []
    while(start_node.parent != None):
        path.append({
            "name": start_node.name,
            "id": start_node.id
        })
        start_node = start_node.parent
    path.append({
        "name": start_node.name,
        "id": start_node.id
    })
    path.reverse()
    return path
