require 'net/http'

uri = URI('http://localhost:28139/api/servers/00000000000/shared_servers/')
req = Net::HTTP::Post.new(uri)
req.content_type = 'application/json'
req["'Accept'"] = "'application/json'"
req['Authorization'] = 'Bearer 000000000000000-0000'

req.body = "{\"server_id\": \"00000000000\",\n                   \"shared_server\": {\"library_section_ids\": 00000000000,\n                                     \"invited_id\": 00000000000}\n                   }\n"

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
