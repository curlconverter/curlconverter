require 'httparty'

url = 'http://localhost:28139/file.txt'
body = File.read('file.txt')
res = HTTParty.put(url, body: body)
