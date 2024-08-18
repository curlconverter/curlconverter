require 'httparty'

url = 'http://localhost:28139/post-to-me.php'
body = {
  username: 'davidwalsh'
  password: 'something'
}
res = HTTParty.post(url, multipart: true, body: body)
