request = %HTTPoison.Request{
  method: :post,
  url: "http://example.com/",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded|},
  ],
  params: [],
  body: [
    {~s|foo|, ~s|\\\'bar\\\'|}
  ]
}

response = HTTPoison.request(request)
