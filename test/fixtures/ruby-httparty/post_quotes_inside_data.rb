require 'httparty'

url = 'http://localhost:28139'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = {
  'field' => "don't you like quotes"
}
res = HTTParty.post(url, headers: headers, body: body)
