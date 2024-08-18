require 'httparty'
require 'json'

url = 'http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da'
auth = { username: 'username', password: 'password'}
headers = {
  'Accept': 'application/vnd.go.cd.v4+json',
  'Content-Type': 'application/json',
}
# The object won't be serialized exactly like this
# body = "{\n        \"hostname\": \"agent02.example.com\",\n        \"agent_config_state\": \"Enabled\",\n        \"resources\": [\"Java\",\"Linux\"],\n        \"environments\": [\"Dev\"]\n        }"
body = {
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
res = HTTParty.patch(url, basic_auth: auth, headers: headers, body: body)
