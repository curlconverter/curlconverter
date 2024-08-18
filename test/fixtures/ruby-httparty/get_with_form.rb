require 'httparty'

url = 'http://localhost:28139/v3'
auth = { username: 'test', password: ''}
body = {
  from: 'test@tester.com'
  to: 'devs@tester.net'
  subject: 'Hello'
  text: 'Testing the converter!'
}
res = HTTParty.post(url, basic_auth: auth, multipart: true, body: body)
