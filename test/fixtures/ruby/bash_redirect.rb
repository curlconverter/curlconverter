require 'net/http'

uri = URI('http://localhost:28139/api/2.0/fo/auth/unix/')
params = {
  :action => 'create',
  :title => 'UnixRecord',
  :username => 'root',
  :password => 'abc123',
  :ips => '10.10.10.10',
}
uri.query = URI.encode_www_form(params)

req = Net::HTTP::Post.new(uri)
req.basic_auth 'USER', 'PASS'
req.content_type = 'text/xml'
req['X-Requested-With'] = 'curl'

req.body = File.binread('add_params.xml').delete("\n")

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
