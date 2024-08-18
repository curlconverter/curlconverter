require 'httparty'

url = 'http://localhost:28139'
headers = {
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': 'SimCity',
  'Referer': 'https://website.com',
}
res = HTTParty.get(url, headers: headers)
