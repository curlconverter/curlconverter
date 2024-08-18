require 'httparty'

url = 'http://localhost:28139?foo=bar&baz=qux'
res = HTTParty.get(url)
