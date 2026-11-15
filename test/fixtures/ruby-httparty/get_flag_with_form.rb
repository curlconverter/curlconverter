require 'httparty'

url = 'http://localhost:28139/upload'
body = {
  name: 'value'
}
res = HTTParty.post(url, multipart: true, body: body)
