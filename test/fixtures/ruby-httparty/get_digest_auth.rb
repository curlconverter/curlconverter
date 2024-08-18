require 'httparty'

url = 'http://localhost:28139/'
auth = { username: 'some_username', password: 'some_password'}
res = HTTParty.get(url, digest_auth: auth)
