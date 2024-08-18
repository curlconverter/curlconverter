require 'httparty'

url = 'http://localhost:28139/test/_security'
auth = { username: 'admin', password: '123'}
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'
res = HTTParty.put(url, basic_auth: auth, headers: headers, body: body)
