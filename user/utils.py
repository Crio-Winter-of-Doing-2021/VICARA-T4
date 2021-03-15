from varname import nameof
from mysite.constants import DATE_TIME_FORMAT, TIMESTAMP
from datetime import datetime, timedelta


def update_profile(profile, *args):
    for attr in args:
        setattr(profile, nameof(attr), attr)
    profile.save()


def remove_oldest(recent):
    presentday = datetime.now()
    oldest_key = None
    # tommorow
    oldest_val = presentday + timedelta(1)
    # smaller the date-time-object the older it is
    for key, val in recent.items():
        timestamp_string = val[TIMESTAMP]
        datetime_object = datetime.strptime(timestamp_string, DATE_TIME_FORMAT)
        if(datetime_object < oldest_val):
            oldest_key = key
            oldest_val = datetime_object
    recent.pop(oldest_key)
