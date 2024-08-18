require 'httparty'

url = 'http://localhost:28139/CurlToNode'
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}
body = '18233982904'
res = HTTParty.post(url, headers: headers, body: body)
