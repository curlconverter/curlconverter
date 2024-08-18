require 'httparty'

url = 'http://localhost:28139/api/2.0/fo/auth/unix/?action=create&title=UnixRecord&username=root&password=abc123&ips=10.10.10.10'
auth = { username: 'USER', password: 'PASS'}
headers = {
  'X-Requested-With': 'curl',
  'Content-Type': 'text/xml',
}
body = File.binread('add_params.xml').delete("\n")
res = HTTParty.post(url, basic_auth: auth, headers: headers, body_stream: body)
