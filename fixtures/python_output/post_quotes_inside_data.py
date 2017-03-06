import requests

data = [
  ('field', 'don\'t you like quotes'),
]

requests.post('google.com', data=data)
