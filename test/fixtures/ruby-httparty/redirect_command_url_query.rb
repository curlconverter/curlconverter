require 'httparty'

url = 'http://localhost:28139?@' + %x{echo image.jpg}
res = HTTParty.get(url)
