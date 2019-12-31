method = :post
url = "http://example.com/post"
headers = []
body = ~s|{"title":"china1"}|
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
