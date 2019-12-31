method = :put
url = "http://localhost:5984/test/_security"
headers = []
body = ~s|{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}|
options = [hackney: [basic_auth: {~s|admin|, ~s|123|}]]
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
