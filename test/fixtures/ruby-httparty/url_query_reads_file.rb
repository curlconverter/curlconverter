require 'httparty'

url = 'http://localhost:28139?name=@myfile.jpg'
res = HTTParty.get(url)
