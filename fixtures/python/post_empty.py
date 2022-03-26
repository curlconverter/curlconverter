import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

response = requests.post('http://localhost:28139', headers=headers)
