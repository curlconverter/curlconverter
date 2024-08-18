require 'httparty'

url = 'http://localhost:28139/v2/images?type=distribution'
headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + ENV['DO_API_TOKEN'],
}
res = HTTParty.get(url, headers: headers)
