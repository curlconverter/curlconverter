request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/api/2.0/files/content",
  options: [],
  headers: [
    {~s|Authorization|, ~s|Bearer ACCESS_TOKEN|},
  ],
  params: [],
  body: {:multipart, [
    {:file, ~s|myfile.jpg|},
    {~s|attributes|, ~s|{"name":"tigers.jpeg", "parent":{"id":"11446498"}}|}
]}
}

response = HTTPoison.request(request)
