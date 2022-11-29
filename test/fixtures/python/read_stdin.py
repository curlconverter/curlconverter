import sys
import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = sys.stdin.read().replace('\n', '').replace('\r', '').encode()

response = requests.post('http://localhost:28139', headers=headers, data=data)
