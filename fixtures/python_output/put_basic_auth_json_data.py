import requests

data = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'

requests.put('http://localhost:5984/test/_security', data=data, auth=('admin', '123'))