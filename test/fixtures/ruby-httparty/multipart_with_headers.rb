require 'httparty'

url = 'http://localhost:28139/api/2.0/files/content'
headers = {
  'Authorization': 'Bearer ACCESS_TOKEN',
  'X-Nice': 'Header',
}
body = {
  attributes: '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}'
  file: File.open('myfile.jpg')
}
res = HTTParty.post(url, headers: headers, body: body)
