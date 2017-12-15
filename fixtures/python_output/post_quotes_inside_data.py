import requests

data = [
  ('field', 'don\'t you like quotes'),
]

response = requests.post('http://google.com', data=data)
