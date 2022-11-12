import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

with open('new_file') as f:
    data = f.readline().strip('\n')

response = requests.put('http://localhost:28139/upload', headers=headers, data=data)
