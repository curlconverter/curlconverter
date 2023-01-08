import os
import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = 'foo'
with open('start' + os.getenv('FILENAME', '') + 'end') as f:
    data += '&' + f.read().replace('\n', '').replace('\r', '')

response = requests.post('http://localhost:28139', headers=headers, data=data.encode())
