require 'net/http'

uri = URI('http://localhost:28139/cookies')
req = Net::HTTP::Get.new(uri)
req['Pragma'] = 'no-cache'
# req['Accept-Encoding'] = 'gzip, deflate, br'
req['Accept-Language'] = 'en-US,en;q=0.9'
req['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36'
req['accept'] = 'application/json'
req['Referer'] = 'https://httpbin.org/'
req['Cookie'] = 'authCookie=123'
req['Connection'] = 'keep-alive'
req['Cache-Control'] = 'no-cache'
req['Sec-Metadata'] = 'destination=empty, site=same-origin'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
