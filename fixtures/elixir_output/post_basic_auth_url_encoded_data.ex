method = :post
url = "http://localhost/api/oauth/token/"
headers = []
body = [
  {~s|grant_type|, ~s|client_credentials|}
]
options = [hackney: [basic_auth: {~s|foo|, ~s|bar|}]]
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
