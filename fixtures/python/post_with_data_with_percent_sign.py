import requests

data = {
  'secret': '*%5*!'
}

response = requests.post('https://postman-echo.com/post', data=data)
