require 'httparty'

url = 'http://localhost:28139/'
auth = { username: '', password: 'some_password'}
res = HTTParty.get(url, basic_auth: auth)
