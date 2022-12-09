require 'net/http'

uri = URI('http://localhost:28139/twitter/_mapping/user?pretty')
req = Net::HTTP::Put.new(uri)
req.content_type = 'application/json'

req.body = File.read('my_file.txt')

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
