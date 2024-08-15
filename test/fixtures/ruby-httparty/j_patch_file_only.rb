require 'httparty'

url = 'http://localhost:28139/patch'
res = HTTParty.patch(url)
