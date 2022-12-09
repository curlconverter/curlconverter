require 'net/http'

uri = URI('http://localhost:28139/api/2.0/files/content')
req = Net::HTTP::Post.new(uri)
req['Authorization'] = 'Bearer ACCESS_TOKEN'
req['X-Nice'] = 'Header'

req.set_form(
  [
    [
      'attributes',
      '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}'
    ],
    [
      'file',
      File.open('myfile.jpg')
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
