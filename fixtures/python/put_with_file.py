import requests

data = open('new_file')
response = requests.put('http://awesomeurl.com/upload', data=data)
