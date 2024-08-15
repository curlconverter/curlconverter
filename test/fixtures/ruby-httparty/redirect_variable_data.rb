require 'httparty'

url = 'http://localhost:28139'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = 'foo&@' + ENV['FILENAME']
res = HTTParty.post(url, headers: headers, body: body)
