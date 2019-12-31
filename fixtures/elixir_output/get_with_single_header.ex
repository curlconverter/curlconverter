method = :get
url = "http://example.com/"
headers = [
  {~s|foo|, ~s|bar|},
]
body = nil
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
