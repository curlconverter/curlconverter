require 'httparty'

url = 'http://localhost:28139/api/xxxxxxxxxxxxxxxx'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = '{"keywords":"php","page":1,"searchMode":1}'
res = HTTParty.post(url, headers: headers, body: body)
