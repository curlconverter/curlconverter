import requests

headers = {
    'foo': 'bar',
}

requests.get('http://example.com/', headers=headers)