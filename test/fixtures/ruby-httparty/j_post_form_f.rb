require 'httparty'

url = 'http://localhost:28139/post'
body = {
  d1: 'data1'
  d2: 'data'
}
res = HTTParty.post(url, multipart: true, body: body)
