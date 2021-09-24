import requests

data = {
  'msg1': 'wow',
  'msg2': 'such',
  'msg3': '@rawmsg'
}

response = requests.post('http://example.com/post', data=data)
