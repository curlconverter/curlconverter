import requests

headers = {
    'Content-Type': 'application/json',
    'X-API-Version': '200',
}

json_data = {
    'userName': 'username123',
    'password': 'password123',
    'authLoginDomain': 'local',
}

response = requests.post('http://localhost:28139/rest/login-sessions', headers=headers, json=json_data, verify=False)

# Note: json_data will not be serialized by requests
# exactly as it was in the original request.
#data = '{"userName":"username123","password":"password123", "authLoginDomain":"local"}'
#response = requests.post('http://localhost:28139/rest/login-sessions', headers=headers, data=data, verify=False)
