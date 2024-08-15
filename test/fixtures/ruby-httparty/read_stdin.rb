require 'httparty'

url = 'http://localhost:28139'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = STDIN.read.delete("\n")
res = HTTParty.post(url, headers: headers, body: body)
