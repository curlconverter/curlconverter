import sys

import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = sys.stdin.readline().strip('\n')

response = requests.post('http://localhost:28139', headers=headers, data=data)
