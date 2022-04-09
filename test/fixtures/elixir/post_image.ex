request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/targetservice",
  options: [],
  headers: [],
  params: [],
  body: {:multipart, [
    {:file, ~s|image.jpg|}
]}
}

response = HTTPoison.request(request)
