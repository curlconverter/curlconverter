require 'net/http'

uri = URI('http://localhost:28139/patch')
req = Net::HTTP::Patch.new(uri)

req.set_form(
  [
    [
      'file1',
      File.open('./test/fixtures/curl_commands/delete.sh')
    ],
    [
      'form1',
      'form+data+1'
    ],
    [
      'form2',
      'form_data_2'
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
