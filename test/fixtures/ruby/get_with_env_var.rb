require 'net/http'

uri = URI('http://localhost:28139/v2/images')
params = {
  :type => 'distribution',
}
uri.query = URI.encode_www_form(params)

req = Net::HTTP::Get.new(uri)
req.content_type = 'application/json'
req['Authorization'] = 'Bearer ' + ENV['DO_API_TOKEN']

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
