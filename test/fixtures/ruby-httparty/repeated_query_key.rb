require 'httparty'

url = 'http://localhost:28139?key=one&key=two'
res = HTTParty.get(url)
