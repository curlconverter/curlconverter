import requests

data = {
    'foo': [
        'bar',
        '',
        'barbar',
    ],
}

response = requests.post('http://localhost:28139/', data=data)
