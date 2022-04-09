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
    data = f.read().replace(b'\n', b'')

response = requests.post('https://localhost:28139/api/2.0/fo/auth/unix/', headers=headers, params=params, data=data, auth=('USER', 'PASS'))
