import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = '123'

response = requests.post('http://localhost:28139', headers=headers, data=data)
