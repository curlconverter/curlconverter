request = %HTTPoison.Request{
  method: :get,
  url: "https://www.site.com/",
  options: [hackney: [:insecure]],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
