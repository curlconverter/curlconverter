request = %HTTPoison.Request{
  method: :head,
  url: "http://localhost:28139/page",
  options: [],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
