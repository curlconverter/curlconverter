import requests

with open('file.txt', 'rb') as f:
    data = f.read()

response = requests.put('http://localhost:28139', data=data)
