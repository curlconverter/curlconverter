require 'net/http'

uri = URI('http://localhost:28139/?format=json&')
req = Net::HTTP::Get.new(uri)
req['Host'] = 'api.ipify.org'
req['Accept'] = '*/*'
req['User-Agent'] = 'GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)'
req['Accept-Language'] = 'en-CN;q=1, zh-Hans-CN;q=0.9'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
