import requests

data = {
  'data': '1',
  'text': '%D2%D4'
}

response = requests.post('http://example.com/', data=data)
