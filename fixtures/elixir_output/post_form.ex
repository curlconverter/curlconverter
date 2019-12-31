method = :post
url = "http://domain.tld/post-to-me.php"
headers = []
body = {:multipart, [
  {~s|username|, ~s|davidwalsh|},
  {~s|password|, ~s|something|}
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
