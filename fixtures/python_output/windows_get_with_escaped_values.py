import requests

data = {
  'a': 'b',
  'c': 'd',
  'e': 'f',
  'h': 'i',
  'j': 'k',
  'l': 'm'
}

response = requests.post('http://www.url.com/page', data=data)