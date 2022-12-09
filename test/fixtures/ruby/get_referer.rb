require 'net/http'

uri = URI('http://localhost:28139')
req = Net::HTTP::Get.new(uri)
req['X-Requested-With'] = 'XMLHttpRequest'
req['User-Agent'] = 'SimCity'
req['Referer'] = 'https://website.com'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
