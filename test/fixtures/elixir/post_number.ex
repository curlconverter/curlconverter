request = %HTTPoison.Request{
  method: :post,
  url: "http://a.com",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded|},
  ],
  params: [],
  body: ~s|123|
}

response = HTTPoison.request(request)
