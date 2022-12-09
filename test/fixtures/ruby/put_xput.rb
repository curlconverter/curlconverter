require 'net/http'
require 'json'

uri = URI('http://localhost:28139/twitter/_mapping/user?pretty')
req = Net::HTTP::Put.new(uri)
req.content_type = 'application/json'

# The object won't be serialized exactly like this
# req.body = '{"properties": {"email": {"type": "keyword"}}}'
req.body = {
  'properties' => {
    'email' => {
      'type' => 'keyword'
    }
  }
}.to_json

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
