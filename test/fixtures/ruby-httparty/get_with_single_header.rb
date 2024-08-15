require 'httparty'

url = 'http://localhost:28139/'
headers = {
  'foo': 'bar',
}
res = HTTParty.get(url, headers: headers)
