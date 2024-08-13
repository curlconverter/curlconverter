require 'httparty'

url = 'http://localhost:28139/post-to-me.php'
res = HTTParty.post(url)

