import requests

headers = {
    'Content-Type': 'application/json',
    'X-API-Version': '200',
}

data = '{"userName":"username123","password":"password123", "authLoginDomain":"local"}'

response = requests.post('https://0.0.0.0/rest/login-sessions', headers=headers, data=data, verify=False)
