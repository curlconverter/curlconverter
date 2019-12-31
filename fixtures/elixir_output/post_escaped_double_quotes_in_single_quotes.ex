method = :post
url = "http://example.com/"
headers = []
body = [
  {~s|foo|, ~s|\\"bar\\"|}
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
