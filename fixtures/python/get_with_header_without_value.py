import requests

headers = {
    'Content-Type': 'text/xml;charset=UTF-8',
}

response = requests.get('http://postman-echo.com/get', headers=headers)
