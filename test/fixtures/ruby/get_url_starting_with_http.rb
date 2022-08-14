require 'net/http'

uri = URI('http://httpbin.org/test')
res = Net::HTTP.get_response(uri)
