import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = 'foo="bar"'

response = requests.post('http://example.com/', headers=headers, data=data)
