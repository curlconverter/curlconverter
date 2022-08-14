require 'net/http'

uri = URI('http://localhost:28139/american-art/query')
req = Net::HTTP::Post.new(uri)
req.content_type = 'application/sparql-query'
req['Accept'] = 'application/sparql-results+json'

req.body = File.open('./sample.sparql').read.delete("\n")

req_options = {
  use_ssl: uri.scheme == "https",
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
