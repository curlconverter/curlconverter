require 'httparty'

url = 'http://localhost:28139/patch'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = 'item[]=1&item[]=2&item[]=3'
res = HTTParty.patch(url, headers: headers, body: body)
