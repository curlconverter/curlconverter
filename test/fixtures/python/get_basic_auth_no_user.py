import requests

response = requests.get('http://localhost:28139/', auth=('', 'some_password'))
