method = :post
url = "http://1.2.3.4/endpoint"
headers = [
  {~s|Content-Type|, ~s|application/json|},
  {~s|key|, ~s|abcdefg|},
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
