request = %HTTPoison.Request{
  method: :post,
  url: "http://google.com",
  options: [],
  headers: [],
  params: [],
  body: [
    {~s|field|, ~s|don\'t you like quotes|}
  ]
}

response = HTTPoison.request(request)
