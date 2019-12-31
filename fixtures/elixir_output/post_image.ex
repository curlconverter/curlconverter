method = :post
url = "http://example.com/targetservice"
headers = []
body = {:multipart, [
  {:file, ~s|image.jpg|}
]}
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
