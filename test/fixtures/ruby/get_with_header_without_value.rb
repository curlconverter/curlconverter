require 'net/http'

uri = URI('http://localhost:28139/get')
req = Net::HTTP::Get.new(uri)
req.content_type = 'text/xml;charset=UTF-8'
req['getWorkOrderCancel'] = ''

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
