import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = '123'

response = requests.post('http://a.com', headers=headers, data=data)
