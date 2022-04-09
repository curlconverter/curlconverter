request = %HTTPoison.Request{
  method: :get,
  url: "http://localhost:28139",
  options: [hackney: [:insecure]],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
