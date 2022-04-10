request = %HTTPoison.Request{
  method: :delete,
  url: "http://localhost:28139/page",
  options: [],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
