require 'httparty'

url = 'http://localhost:28139/file.txt'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = File.read('file.txt')
res = HTTParty.put(url, headers: headers, body: body)


url = 'http://localhost:28139'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = {
  'different' => 'data',
  'time' => 'now'
}
res = HTTParty.post(url, headers: headers, body: body)
