require 'net/http'

uri = URI('http://localhost:28139')
req = Net::HTTP::Get.new(uri)

proxy = URI('http://localhost:8080')
req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, proxy.hostname, proxy.port, 'anonymous', 'anonymous', req_options) do |http|
  http.request(req)
end
