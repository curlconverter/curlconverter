require 'net/http'
require 'json'
require 'openssl'

uri = URI('http://localhost:28139/rest/login-sessions')
req = Net::HTTP::Post.new(uri)
req.content_type = 'application/json'
req['X-API-Version'] = '200'

# The object won't be serialized exactly like this
# req.body = '{"userName":"username123","password":"password123", "authLoginDomain":"local"}'
req.body = {
  'userName' => 'username123',
  'password' => 'password123',
  'authLoginDomain' => 'local'
}.to_json

req_options = {
  use_ssl: uri.scheme == 'https',
  verify_mode: OpenSSL::SSL::VERIFY_NONE
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
