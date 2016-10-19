import requests

data = {
  'foo': '\"bar\"'
}

requests.post('http://example.com/', data=data)