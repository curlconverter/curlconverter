request = %HTTPoison.Request{
  method: :what,
  url: "http://example.com",
  options: [],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
