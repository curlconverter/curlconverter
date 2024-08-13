require 'httparty'

url = 'http://localhost:28139/api/2.0/files/content'
headers = {
  'Authorization': 'Bearer ACCESS_TOKEN',
  'X-Nice': 'Header',
}
res = HTTParty.post(url, headers: headers)

