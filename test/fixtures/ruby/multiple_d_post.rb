require 'net/http'

uri = URI('http://localhost:28139/webservices/rest.php')
req = Net::HTTP::Post.new(uri)
req.content_type = 'application/x-www-form-urlencoded'

req.body = 'version=1.2&auth_user=fdgxf&auth_pwd=oxfdscds&json_data={ "operation": "core/get", "class": "Software", "key": "key" }'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
