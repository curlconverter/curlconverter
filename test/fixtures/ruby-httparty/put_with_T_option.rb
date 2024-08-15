require 'httparty'

url = 'http://localhost:28139/twitter/_mapping/user?pretty'
headers = {
  'Content-Type': 'application/json',
}
body = File.read('my_file.txt')
res = HTTParty.put(url, headers: headers, body: body)
