import requests

data = [
  ('foo', '\'bar\''),
]

response = requests.post('http://example.com/', data=data)
