import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = 'secret=*%5*!'

response = requests.post('https://postman-echo.com/post', headers=headers, data=data)
