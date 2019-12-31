request = %HTTPoison.Request{
  method: :delete,
  url: "http://www.url.com/page",
  options: [],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
