require 'net/http'
require 'json'

uri = URI('http://localhost:28139')
req = Net::HTTP::Post.new(uri)
req.content_type = 'application/json'
req['Accept'] = 'application/json'

# The object won't be serialized exactly like this
# req.body = '{ "drink": "coffe" }'
req.body = {
  'drink' => 'coffe'
}.to_json

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
