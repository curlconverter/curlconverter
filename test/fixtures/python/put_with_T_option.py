import requests

headers = {
    'Content-Type': 'application/json',
}

with open('my_file.txt', 'rb') as f:
    data = f.read()

response = requests.put('http://localhost:28139/twitter/_mapping/user?pretty', headers=headers, data=data)
