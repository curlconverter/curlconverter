require 'net/http'

uri = URI('http://localhost:28139/api/retail/books/list')
req = Net::HTTP::Get.new(uri)
req['Accept'] = 'application/json'
req['user-token'] = '75d7ce4350c7d6239347bf23d3a3e668'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
