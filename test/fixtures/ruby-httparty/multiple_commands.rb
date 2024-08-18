require 'httparty'

url = 'http://localhost:28139'
res = HTTParty.get(url)


url = 'http://localhost:28139/second'
res = HTTParty.get(url)


url = 'http://localhost:28139/third'
body = File.read('input_redirected_file.txt')
res = HTTParty.put(url, body: body)
