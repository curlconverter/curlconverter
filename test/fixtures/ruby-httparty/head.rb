require 'httparty'

url = 'http://localhost:28139/page'
res = HTTParty.head(url)
