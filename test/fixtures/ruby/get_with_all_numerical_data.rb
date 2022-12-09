require 'net/http'

uri = URI('http://localhost:28139/CurlToNode')
req = Net::HTTP::Post.new(uri)
req.content_type = 'application/json'
req['Accept'] = 'application/json'

req.body = '18233982904'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
