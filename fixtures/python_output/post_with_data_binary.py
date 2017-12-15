import requests

data = '{"title":"china1"}'

response = requests.post('http://example.com/post', data=data)
