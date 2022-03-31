request = %HTTPoison.Request{
  method: :get,
  url: "http://www.google.com",
  options: [],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
