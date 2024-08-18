require 'httparty'

url = 'http://localhost:28139/'
auth = { username: 'some_username', password: 'some_password'}
res = HTTParty.get(url, basic_auth: auth, verify: false)
