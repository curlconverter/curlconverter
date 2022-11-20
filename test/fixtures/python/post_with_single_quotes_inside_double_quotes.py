import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = "foo='bar'"

response = requests.post('http://localhost:28139/', headers=headers, data=data)
