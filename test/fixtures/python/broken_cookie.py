import requests

headers = {
    'Cookie': 'a=b; c',
}

response = requests.get('http://localhost:8888/', headers=headers)
