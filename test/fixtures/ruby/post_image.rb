require 'net/http'

uri = URI('http://localhost:28139/targetservice')
req = Net::HTTP::Post.new(uri)

req.set_form(
  [
    [
      'image',
      File.open('image.jpg')
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
