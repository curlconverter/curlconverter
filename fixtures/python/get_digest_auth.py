import requests
from requests.auth import HTTPDigestAuth

response = requests.get('http://localhost:28139/', auth=HTTPDigestAuth('some_username', 'some_password'))
