import requests

data = open('new_file')
requests.put('http://awesomeurl.com/upload', data=data)