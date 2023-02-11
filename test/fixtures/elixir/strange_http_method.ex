request = %HTTPoison.Request{
  method: :what,
  url: "http://localhost:28139",
  body: "",
  headers: [],
  options: [],
  params: []
}

response = HTTPoison.request(request)
