import requests

headers = {
    'Content-Type': 'application/json',
    'key': 'abcdefg',
}

response = requests.post('http://localhost:28139/endpoint', headers=headers)
