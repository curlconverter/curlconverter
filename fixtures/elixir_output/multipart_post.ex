method = :post
url = "https://upload.box.com/api/2.0/files/content"
headers = [
  {~s|Authorization|, ~s|Bearer ACCESS_TOKEN|},
]
body = {:multipart, [
  {:file, ~s|myfile.jpg|},
  {~s|attributes|, ~s|{"name":"tigers.jpeg", "parent":{"id":"11446498"}}|}
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
