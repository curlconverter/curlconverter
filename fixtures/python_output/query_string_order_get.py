import requests

params = [
    ('firstparam', '1'),
    ('secondparam', '2'),
    ('firstparam', '1')
]

response = requests.get('http://localhost:8888/', params=params)
