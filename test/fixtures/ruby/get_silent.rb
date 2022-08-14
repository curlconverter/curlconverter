require 'net/http'

uri = URI('http://localhost:28139')
res = Net::HTTP.get_response(uri)
