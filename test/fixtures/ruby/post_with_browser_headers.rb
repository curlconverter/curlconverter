require 'net/http'

uri = URI('http://localhost:28139/ajax/demo_post.asp')
req = Net::HTTP::Post.new(uri)
req['Origin'] = 'http://www.w3schools.com'
# req['Accept-Encoding'] = 'gzip, deflate'
req['Accept-Language'] = 'en-US,en;q=0.8'
req['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
req['Accept'] = '*/*'
req['Referer'] = 'http://www.w3schools.com/ajax/tryit_view.asp?x=0.07944501144811511'
req['Cookie'] = '_gat=1; ASPSESSIONIDACCRDTDC=MCMDKFMBLLLHGKCGNMKNGPKI; _ga=GA1.2.1424920226.1419478126'
req['Connection'] = 'keep-alive'
# req['Content-Length'] = '0'

req_options = {
  use_ssl: uri.scheme == 'https'
}
res = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(req)
end
