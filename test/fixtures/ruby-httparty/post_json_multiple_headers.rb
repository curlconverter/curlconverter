require 'httparty'
require 'json'

url = 'http://localhost:28139/rest/login-sessions'
headers = {
  'Content-Type': 'application/json',
  'X-API-Version': '200',
}
# The object won't be serialized exactly like this
# body = '{"userName":"username123","password":"password123", "authLoginDomain":"local"}'
body = {
  'userName' => 'username123',
  'password' => 'password123',
  'authLoginDomain' => 'local'
}.to_json
res = HTTParty.post(url, headers: headers, body: body, verify: false)
