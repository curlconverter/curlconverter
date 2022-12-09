require 'net/http'

uri = URI('http://localhost:28139')
req = Net::HTTPGenericRequest.new('wHat', true, true, uri)

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
