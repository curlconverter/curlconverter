import requests

data = [
    ('firstparam', '1'),
    ('secondparam', '2'),
    ('firstparam', '1')
]

response = requests.post('http://localhost:8888/', data=data)
