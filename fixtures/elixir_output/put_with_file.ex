method = :put
url = "http://awesomeurl.com/upload"
headers = []
body = {:file, ~s|new_file|}
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
