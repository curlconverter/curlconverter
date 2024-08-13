require 'httparty'

url = 'http://localhost:28139/api/oauth/token/'
basic_auth = { username: 'foo', password: 'bar'}
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = {
  'grant_type' => 'client_credentials'
}
res = HTTParty.post(url, basic_auth: basic_auth, headers: headers, body: body)

