require 'httparty'
require 'json'

url = 'http://localhost:28139/twitter/_mapping/user?pretty'
headers = {
  'Content-Type': 'application/json',
}
# The object won't be serialized exactly like this
# body = '{"properties": {"email": {"type": "keyword"}}}'
body = {
  'properties' => {
    'email' => {
      'type' => 'keyword'
    }
  }
}.to_json
res = HTTParty.put(url, headers: headers, body: body)
