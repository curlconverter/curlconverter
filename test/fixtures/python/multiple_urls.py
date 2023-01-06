import requests

data = {
    'fooo': 'blah',
}

with open('file.txt', 'rb') as f:
    file_contents = f.read()
response = requests.put('http://localhost:28139/file.txt', data=file_contents)

params = {
    'params': 'perurltoo',
}
with open('myfile.jpg', 'rb') as f:
    file_contents = f.read()
response = requests.put('http://localhost:28139/myfile.jpg', params=params, data=file_contents)

response = requests.post('http://localhost:28139', data=data)


data = {
    'different': 'data',
    'time': 'now',
}

response = requests.post('http://localhost:28139', data=data)
