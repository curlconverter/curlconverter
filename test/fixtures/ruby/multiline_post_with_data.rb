require 'net/http'

uri = URI('http://localhost:28139/echo/html/')
req = Net::HTTP::Get.new(uri)
req.content_type = 'application/x-www-form-urlencoded'
req['Origin'] = 'http://fiddle.jshell.net'

req.set_form_data({
  'msg1' => 'value1',
  'msg2' => 'value2'
})

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
