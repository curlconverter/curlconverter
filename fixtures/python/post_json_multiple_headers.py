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

response = requests.post('https://0.0.0.0/rest/login-sessions', headers=headers, json=json_data, verify=False)

# Note: the data is posted as JSON, which might not be serialized
# by Requests exactly as it appears in the original command. So
# the original data is also given.
#data = '{"userName":"username123","password":"password123", "authLoginDomain":"local"}'
#response = requests.post('https://0.0.0.0/rest/login-sessions', headers=headers, data=data, verify=False)
