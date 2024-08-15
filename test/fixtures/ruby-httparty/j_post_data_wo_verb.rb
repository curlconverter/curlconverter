require 'httparty'

url = 'http://localhost:28139/post'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = {
  'data1' => 'data1',
  'data2' => 'data2',
  'data3' => 'data3'
}
res = HTTParty.post(url, headers: headers, body: body)
