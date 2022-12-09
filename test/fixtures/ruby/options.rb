require 'net/http'

uri = URI('http://localhost:28139/api/tunein/queue-and-play')
params = {
  :deviceSerialNumber => 'xxx',
  :deviceType => 'xxx',
  :guideId => 's56876',
  :contentType => 'station',
  :callSign => '',
  :mediaOwnerCustomerId => 'xxx',
}
uri.query = URI.encode_www_form(params)

req = Net::HTTP::Options.new(uri)
req['Pragma'] = 'no-cache'
req['Access-Control-Request-Method'] = 'POST'
req['Origin'] = 'https://alexa.amazon.de'
# req['Accept-Encoding'] = 'gzip, deflate, br'
req['Accept-Language'] = 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4'
req['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
req['Accept'] = '*/*'
req['Cache-Control'] = 'no-cache'
req['Referer'] = 'https://alexa.amazon.de/spa/index.html'
req['Connection'] = 'keep-alive'
req['DNT'] = '1'
req['Access-Control-Request-Headers'] = 'content-type,csrf'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
