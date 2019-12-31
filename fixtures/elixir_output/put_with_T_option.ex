method = :put
url = "http://localhost:9200/twitter/_mapping/user"
headers = [
  {~s|Content-Type|, ~s|application/json|},
]
body = ~s|{"properties": {"email": {"type": "keyword"}}}|
options = []
params = [
  {~s|pretty|, ""},
]

request = %HTTPoison.Request{
  method: method,
  url: url,
  body: body,
  headers: headers,
  options: options,
  params: params,
}

response = HTTPoison.request(request)
