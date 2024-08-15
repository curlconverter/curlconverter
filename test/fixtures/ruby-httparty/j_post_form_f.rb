require 'httparty'

url = 'http://localhost:28139/post'
res = HTTParty.post(url)
