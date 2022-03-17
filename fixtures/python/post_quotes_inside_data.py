import requests

data = 'field=don%27t%20you%20like%20quotes'

response = requests.post('http://google.com', data=data)
