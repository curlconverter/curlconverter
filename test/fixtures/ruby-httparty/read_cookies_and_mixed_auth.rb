require 'httparty'

url = 'http://localhost:28139'
headers = {
  'Authorization': 'Bearer AAAAAAAAAAAA',
}
res = HTTParty.get(url, headers: headers)
