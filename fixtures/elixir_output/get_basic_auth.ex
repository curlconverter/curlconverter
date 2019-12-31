method = :get
url = "https://api.test.com/"
headers = []
body = nil
options = [hackney: [basic_auth: {~s|some_username|, ~s|some_password|}]]
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
