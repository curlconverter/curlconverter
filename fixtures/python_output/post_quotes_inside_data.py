import requests

data = [
  ('field', 'don\'t you like quotes'),
]

requests.post('http://google.com', data=data)
