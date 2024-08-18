require 'httparty'

url = 'http://localhost:28139/echo/html/'
headers = {
  'Origin': 'http://fiddle.jshell.net',
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = {
  'msg1' => 'value1',
  'msg2' => 'value2'
}
res = HTTParty.get(url, headers: headers, body: body)
