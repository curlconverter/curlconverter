require 'httparty'

url = 'http://localhost:28139/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812'
headers = {
  'x-msisdn': 'XXXXXXXXXXXXX',
  'user-agent': 'Mozilla Android6.1',
}
res = HTTParty.get(url, headers: headers)

