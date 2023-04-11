import requests

response = requests.get('http://localhost:28139')


response = requests.get('http://localhost:28139/second')


with open('input_redirected_file.txt', 'rb') as f:
    data = f.read()

response = requests.put('http://localhost:28139/third', data=data)
