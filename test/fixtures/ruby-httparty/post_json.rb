require 'httparty'
require 'json'

url = 'http://localhost:28139'
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}
# The object won't be serialized exactly like this
# body = '{ "drink": "coffe" }'
body = {
  'drink' => 'coffe'
}.to_json
res = HTTParty.post(url, headers: headers, body: body)
