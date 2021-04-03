from celery import shared_task
from .utils import sendMail

MAIL_DEFAULTS = {
    "SHARED_WITH_ME": {
        "title": "{sender_name} has shared {resource_name} with you",
        "body": "Hi {recepient_name},\n Kindly use this link below to access {resource_url}"
    }
}


@shared_task
def send_mail(type, user_list, title_kwargs, body_kwargs):
    for user in user_list:
        title = MAIL_DEFAULTS[type]["title"].format(**title_kwargs)
        body_kwargs = {**body_kwargs,
                       "recepient_name": user["first_name"]
                       }
        body = MAIL_DEFAULTS[type]["body"].format(**body_kwargs)
        sendMail(title, body, [user["email"]])


def sync_send_mail(type, user_list, title_kwargs, body_kwargs):
    for user in user_list:
        title = MAIL_DEFAULTS[type]["title"].format(**title_kwargs)
        body_kwargs = {**body_kwargs,
                       "recepient_name": user["first_name"]
                       }
        body = MAIL_DEFAULTS[type]["body"].format(**body_kwargs)
        sendMail(title, body, [user["email"]])
