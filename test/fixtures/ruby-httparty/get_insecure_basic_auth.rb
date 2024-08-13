require 'httparty'

url = 'http://localhost:28139/'
basic_auth = { username: 'some_username', password: 'some_password'}
res = HTTParty.get(url, basic_auth: basic_auth, verify: false)

