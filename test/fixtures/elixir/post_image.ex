request = %HTTPoison.Request{
  method: :post,
  url: "http://example.com/targetservice",
  options: [],
  headers: [],
  params: [],
  body: {:multipart, [
    {:file, ~s|image.jpg|}
]}
}

response = HTTPoison.request(request)
