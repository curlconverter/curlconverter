require 'httparty'

url = 'http://httpbin.org/test'
res = HTTParty.get(url)
