method = :post
url = "http://a.com/"
headers = []
body = ~s|123|
options = []
params = []

request = %HTTPoison.Request{
  method: method,
  url: url,
  body: body,
  headers: headers,
  options: options,
  params: params,
}

response = HTTPoison.request(request)
