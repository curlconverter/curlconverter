request = %HTTPoison.Request{
  method: :head,
  url: "http://www.url.com/page",
  options: [],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
