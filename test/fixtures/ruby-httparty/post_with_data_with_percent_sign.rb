require 'httparty'

url = 'http://localhost:28139/post'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = 'secret=*%5*!'
res = HTTParty.post(url, headers: headers, body: body)
