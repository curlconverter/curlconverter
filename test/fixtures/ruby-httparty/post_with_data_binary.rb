require 'httparty'

url = 'http://localhost:28139/post'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = '{"title":"china1"}'
res = HTTParty.post(url, headers: headers, body: body)
