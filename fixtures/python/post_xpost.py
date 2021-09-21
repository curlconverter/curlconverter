import requests

data = '{"keywords":"php","page":1,"searchMode":1}'

response = requests.post('http://us.jooble.org/api/xxxxxxxxxxxxxxxx', data=data)
