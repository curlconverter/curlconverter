request = %HTTPoison.Request{
  method: :get,
  url: "https://example.com/",
  options: [hackney: [:insecure]],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
