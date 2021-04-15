# [VICARA-T4](https://vicara.netlify.app/)-#[CWOD](https://www.crio.do/crio-winter-of-doing/) Stage3

Team ID: VICARA-T4 | Team Members: [Ashutosh Panda](https://github.com/aashutoshPanda) &amp; [Pratik Chaudhary](https://github.com/pratik0204)

- WEBSITE HOSTED: https://vicara.netlify.app/
- BACKEND-HOSTED: http://vicara-drf-backend.herokuapp.com/

Make sure you have [python3](https://www.python.org/downloads/) and [git](https://git-scm.com/) installed on your local machine.

## Getting Started

Setup project environment-

```bash
$ sudo apt-get update -y
$ sudo apt-get install python3-pip -y
$ sudo apt-get install python3-venv -y

$ git clone https://github.com/Crio-Winter-of-Doing-2021/VICARA-T4.git
$ cd VICARA-T4

$ python3 -m venv env
$ source env/bin/activate
$ source project-env/bin/activate
$ pip3 install -r requirements.txt

$ python manage.py migrate
$ python manage.py migrate --run-syncdb
$ python manage.py runserver
```

## Frontend
You can cd into the client folder, and follow the readme there.

## Contributing
We love contributions, so please feel free to add issues fix bugs, improve things, provide documentation and make a PR.
