request = %HTTPoison.Request{
  method: :post,
  url: "http://google.com/",
  options: [],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
