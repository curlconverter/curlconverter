import requests

headers = {
    'foo': 'bar',
}

response = requests.get('http://example.com/', headers=headers)
