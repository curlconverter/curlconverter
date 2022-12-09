require 'net/http'

uri = URI('http://localhost:28139/synthetics/api/v3/monitors')
params = {
  :test => '2',
  :limit => '100',
  :w => '4',
}
uri.query = URI.encode_www_form(params)

req = Net::HTTP::Get.new(uri)
req['X-Api-Key'] = '123456789'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
