require 'net/http'

uri = URI('http://localhost:28139/test/_security')
req = Net::HTTP::Put.new(uri)
req.basic_auth 'admin', '123'
req.content_type = 'application/x-www-form-urlencoded'

req.body = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
