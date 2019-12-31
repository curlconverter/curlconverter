request = %HTTPoison.Request{
  method: :post,
  url: "http://example.com/post",
  options: [],
  headers: [],
  params: [],
  body: ~s|{"title":"china1"}|
}

response = HTTPoison.request(request)
