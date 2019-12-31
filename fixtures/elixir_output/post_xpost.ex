method = :post
url = "http://us.jooble.org/api/xxxxxxxxxxxxxxxx"
headers = []
body = ~s|{"keywords":"php","page":1,"searchMode":1}|
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
