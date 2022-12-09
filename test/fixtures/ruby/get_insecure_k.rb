require 'net/http'
require 'openssl'

uri = URI('http://localhost:28139')
req = Net::HTTP::Get.new(uri)

req_options = {
  use_ssl: uri.scheme == 'https',
  verify_mode: OpenSSL::SSL::VERIFY_NONE
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
