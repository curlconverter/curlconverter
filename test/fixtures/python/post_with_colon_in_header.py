import requests

headers = {
    'Content-Type': 'application/json',
    'key': 'abcdefg',
}

response = requests.post('http://1.2.3.4/endpoint', headers=headers)
