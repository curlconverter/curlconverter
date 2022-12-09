require 'net/http'

uri = URI('http://localhost:28139/upload')
req = Net::HTTP::Put.new(uri)
req.content_type = 'application/x-www-form-urlencoded'

req.body = File.read('new_file').delete("\n")

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
