import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = '{"title":"china1"}'

response = requests.post('http://localhost:28139/post', headers=headers, data=data)
