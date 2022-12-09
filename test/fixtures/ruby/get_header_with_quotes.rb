require 'net/http'

uri = URI('http://localhost:28139')
req = Net::HTTP::Get.new(uri)
req['sec-ch-ua'] = '" Not A;Brand";v="99", "Chromium";v="92"'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
