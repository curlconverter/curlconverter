require 'net/http'

uri = URI('http://localhost:28139/api/oauth/token/')
req = Net::HTTP::Post.new(uri)
req.basic_auth 'foo', 'bar'
req.content_type = 'application/x-www-form-urlencoded'

req.set_form_data({
  'grant_type' => 'client_credentials'
})

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
