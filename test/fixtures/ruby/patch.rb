require 'net/http'
require 'json'

uri = URI('http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da')
req = Net::HTTP::Patch.new(uri)
req.basic_auth 'username', 'password'
req.content_type = 'application/json'
req['Accept'] = 'application/vnd.go.cd.v4+json'

# The object won't be serialized exactly like this
# req.body = "{\n        \"hostname\": \"agent02.example.com\",\n        \"agent_config_state\": \"Enabled\",\n        \"resources\": [\"Java\",\"Linux\"],\n        \"environments\": [\"Dev\"]\n        }"
req.body = {
  'hostname' => 'agent02.example.com',
  'agent_config_state' => 'Enabled',
  'resources' => [
    'Java',
    'Linux'
  ],
  'environments' => [
    'Dev'
  ]
}.to_json

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
