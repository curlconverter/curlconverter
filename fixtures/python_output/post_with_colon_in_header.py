import requests

headers = {
    'Content-Type': 'application/json',
    'key': 'abcdefg',
}

requests.post('http://1.2.3.4/endpoint', headers=headers)