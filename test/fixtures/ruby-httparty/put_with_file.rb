require 'httparty'

url = 'http://localhost:28139/upload'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = File.read('new_file').delete("\n")
res = HTTParty.put(url, headers: headers, body: body)
