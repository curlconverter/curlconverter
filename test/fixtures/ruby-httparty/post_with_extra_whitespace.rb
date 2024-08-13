require 'httparty'

url = 'http://localhost:28139/api/library'
headers = {
  'accept': 'application/json',
  'Content-Type': 'multipart/form-data',
}
res = HTTParty.post(url, headers: headers)

