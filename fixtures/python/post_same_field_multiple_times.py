import requests

data = [
  ('foo', 'bar'),
  ('foo', ''),
  ('foo', 'barbar'),
]

response = requests.post('http://example.com/', data=data)
