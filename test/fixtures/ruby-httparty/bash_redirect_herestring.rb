require 'httparty'

url = 'http://localhost:28139/api/servers/00000000000/shared_servers/'
headers = {
  "'Accept'": "'application/json'",
  'Authorization': 'Bearer 000000000000000-0000',
  'Content-Type': 'application/json',
}
body = STDIN.read.delete("\n")
res = HTTParty.post(url, headers: headers, body_stream: body)
