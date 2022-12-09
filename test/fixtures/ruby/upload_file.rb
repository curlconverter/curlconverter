require 'net/http'

uri = URI('http://localhost:28139/file.txt')
req = Net::HTTP::Put.new(uri)

req.body = File.read('file.txt')

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
