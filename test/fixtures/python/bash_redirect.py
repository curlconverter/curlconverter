import requests

headers = {
    'X-Requested-With': 'curl',
    'Content-Type': 'text/xml',
}

params = {
    'action': 'create',
    'title': 'UnixRecord',
    'username': 'root',
    'password': 'abc123',
    'ips': '10.10.10.10',
}

with open('add_params.xml', 'rb') as f:
    data = f.read()

response = requests.post(
    'http://localhost:28139/api/2.0/fo/auth/unix/',
    params=params,
    headers=headers,
    data=data,
    auth=('USER', 'PASS'),
)
