require 'net/http'

uri = URI('http://localhost:28139/vc/moviesmagic')
params = {
  :p => '5',
  :pub => 'testmovie',
  :tkn => '817263812',
}
uri.query = URI.encode_www_form(params)

req = Net::HTTP::Get.new(uri)
req['x-msisdn'] = 'XXXXXXXXXXXXX'
req['user-agent'] = 'Mozilla Android6.1'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
