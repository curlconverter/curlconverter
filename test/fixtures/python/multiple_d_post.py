import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = 'version=1.2&auth_user=fdgxf&auth_pwd=oxfdscds&json_data={ "operation": "core/get", "class": "Software", "key": "key" }'

response = requests.post('http://localhost:28139/webservices/rest.php', headers=headers, data=data)
