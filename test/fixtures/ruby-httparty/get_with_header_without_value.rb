require 'httparty'

url = 'http://localhost:28139/get'
headers = {
  'Content-Type': 'text/xml;charset=UTF-8',
  'getWorkOrderCancel': '',
}
res = HTTParty.get(url, headers: headers)
