require 'httparty'

url = 'http://localhost:28139'
basic_auth = { username: "ol'", password: 'asd"'}
headers = {
  'A': "''a'",
  'B': '"',
  'Cookie': 'x=1\'; y=2"',
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = 'a=b&c="&d=\''
res = HTTParty.post(url, basic_auth: basic_auth, headers: headers, body: body)
