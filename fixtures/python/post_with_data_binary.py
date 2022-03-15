import requests

data = '{"title":"china1"}'

response = requests.post('http://localhost:28139/post', data=data)
