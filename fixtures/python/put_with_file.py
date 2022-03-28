import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

with open('new_file') as f:
    data = f.read().replace('\n', '')

response = requests.put('http://awesomeurl.com/upload', headers=headers, data=data)
