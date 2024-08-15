require 'httparty'

url = 'http://localhost:28139/targetservice'
res = HTTParty.post(url)
