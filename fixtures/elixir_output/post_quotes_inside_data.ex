method = :post
url = "http://google.com"
headers = []
body = [
  {~s|field|, ~s|don\'t you like quotes|}
]
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
