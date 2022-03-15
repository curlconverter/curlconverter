import requests

data = {
    'foo': [
        'bar',
        '',
        'barbar',
    ],
}

response = requests.post('http://example.com/', data=data)
