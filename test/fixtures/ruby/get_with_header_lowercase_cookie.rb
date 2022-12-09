require 'net/http'

uri = URI('http://localhost:28139/page')
req = Net::HTTP::Get.new(uri)
req['cookie'] = 'secure_user_id=InNlY3VyZTEwNjI3Ig%3D%3D--3b5df49345735791f2b80eddafb630cdcba76a1d; adaptive_image=1440; has_js=1; ccShowCookieIcon=no; _web_session=Y2h...e5'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
