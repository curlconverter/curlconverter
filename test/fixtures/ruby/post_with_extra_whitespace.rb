require 'net/http'

uri = URI('http://localhost:28139/api/library')
req = Net::HTTP::Post.new(uri)
req['accept'] = 'application/json'

req.set_form(
  [
    [
      'files',
      File.open('47.htz')
    ],
    [
      'name',
      '47'
    ],
    [
      'oldMediaId',
      '47'
    ],
    [
      'updateInLayouts',
      '1'
    ],
    [
      'deleteOldRevisions',
      '1'
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
