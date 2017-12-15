import requests

data = [
  ('grant_type', 'client_credentials'),
]

response = requests.post('http://localhost/api/oauth/token/', data=data, auth=('foo', 'bar'))
