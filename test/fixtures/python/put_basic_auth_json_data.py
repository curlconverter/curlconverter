import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'

response = requests.put('http://localhost:28139/test/_security', headers=headers, data=data, auth=('admin', '123'))
