require 'httparty'

url = 'http://localhost:28139/endpoint'
headers = {
  'Content-Type': 'application/json',
  'key': 'abcdefg',
}
res = HTTParty.post(url, headers: headers)
