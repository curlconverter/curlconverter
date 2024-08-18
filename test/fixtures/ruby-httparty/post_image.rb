require 'httparty'

url = 'http://localhost:28139/targetservice'
body = {
  image: File.open('image.jpg')
}
res = HTTParty.post(url, body: body)
