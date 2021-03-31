import re

email_regex = '^(\w|\.|\_|\-)+[@](\w|\_|\-|\.)+[.]\w{2,3}$'


def is_valid_email(email):
    return re.search(email_regex, email)
