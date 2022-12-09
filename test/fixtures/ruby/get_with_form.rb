require 'net/http'

uri = URI('http://localhost:28139/v3')
req = Net::HTTP::Post.new(uri)
req.basic_auth 'test', ''

req.set_form(
  [
    [
      'from',
      'test@tester.com'
    ],
    [
      'to',
      'devs@tester.net'
    ],
    [
      'subject',
      'Hello'
    ],
    [
      'text',
      'Testing the converter!'
    ]
  ],
  'multipart/form-data'
)

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
