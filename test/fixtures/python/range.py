import requests

headers = {
    'Range': 'bytes=600-',
}

response = requests.get('http://localhost:28139', headers=headers)
