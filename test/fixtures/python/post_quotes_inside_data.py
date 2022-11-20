import requests

data = {
    'field': "don't you like quotes",
}

response = requests.post('http://localhost:28139', data=data)
