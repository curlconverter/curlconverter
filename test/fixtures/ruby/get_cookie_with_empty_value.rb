require 'net/http'

uri = URI('http://localhost:28139/cookies')
req = Net::HTTP::Get.new(uri)
req['accept'] = 'application/json'
req['Cookie'] = 'mysamplecookie=someValue; emptycookie=; otherCookie=2'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
