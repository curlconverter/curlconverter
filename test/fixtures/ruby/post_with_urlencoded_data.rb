require 'net/http'

uri = URI('http://localhost:28139/echo/html/')
req = Net::HTTP::Post.new(uri)
req.content_type = 'application/x-www-form-urlencoded; charset=UTF-8'
req['Origin'] = 'http://fiddle.jshell.net'
# req['Accept-Encoding'] = 'gzip, deflate'
req['Accept-Language'] = 'en-US,en;q=0.8'
req['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
req['Accept'] = '*/*'
req['Referer'] = 'http://fiddle.jshell.net/_display/'
req['X-Requested-With'] = 'XMLHttpRequest'
req['Connection'] = 'keep-alive'

req.set_form_data({
  'msg1' => 'wow',
  'msg2' => 'such'
})

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
