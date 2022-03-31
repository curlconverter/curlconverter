request = %HTTPoison.Request{
  method: :post,
  url: "http://google.com",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded|},
  ],
  params: [],
  body: [
    {~s|field|, ~s|don't you like quotes|}
  ]
}

response = HTTPoison.request(request)
