import requests

data = [
  ('foo', 'bar'),
  ('foo', ''),
  ('foo', 'barbar'),
]

requests.post('http://example.com/', data=data)
