import sys
import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = sys.stdin.read().replace('\n', '').replace('\r', '').encode('utf-8')

response = requests.post('http://localhost:28139', headers=headers, data=data)
