require 'httparty'

url = 'http://localhost:28139/test/_security'
basic_auth = { username: 'admin', password: '123'}
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'
res = HTTParty.put(url, basic_auth: basic_auth, headers: headers, body: body)
