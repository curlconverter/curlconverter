require 'httparty'

url = 'http://localhost:28139'
headers = {
  'Range': 'bytes=600-',
}
res = HTTParty.get(url, headers: headers)
