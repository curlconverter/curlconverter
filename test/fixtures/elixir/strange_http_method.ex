request = %HTTPoison.Request{
  method: :what,
  url: "http://localhost:28139",
  options: [],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
