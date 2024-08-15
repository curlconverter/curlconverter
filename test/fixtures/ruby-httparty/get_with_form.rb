require 'httparty'

url = 'http://localhost:28139/v3'
basic_auth = { username: 'test', password: ''}
res = HTTParty.post(url, basic_auth: basic_auth)
