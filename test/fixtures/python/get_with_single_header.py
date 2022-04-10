import requests

headers = {
    'foo': 'bar',
}

response = requests.get('http://localhost:28139/', headers=headers)
