request = %HTTPoison.Request{
  method: :get,
  url: "http://indeed.com/",
  options: [],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
