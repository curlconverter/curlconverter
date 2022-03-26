import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = open('new_file')

response = requests.put('http://awesomeurl.com/upload', headers=headers, data=data)
