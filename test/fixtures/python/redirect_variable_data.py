import os
import requests

FILENAME = os.getenv('FILENAME')

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = 'foo'
with open(FILENAME) as f:
    data += '&' + f.read().replace('\n', '').replace('\r', '')

response = requests.post('http://localhost:28139', headers=headers, data=data.encode())
