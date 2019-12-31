method = :get
url = "https://example.com/"
headers = []
body = nil
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
