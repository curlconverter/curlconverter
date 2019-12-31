method = :post
url = "https://0.0.0.0/rest/login-sessions"
headers = [
  {~s|Content-Type|, ~s|application/json|},
  {~s|X-API-Version|, ~s|200|},
]
body = ~s|{"userName":"username123","password":"password123", "authLoginDomain":"local"}|
options = [hackney: [:insecure]]
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
