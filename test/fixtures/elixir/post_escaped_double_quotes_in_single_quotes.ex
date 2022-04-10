request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded|},
  ],
  params: [],
  body: [
    {~s|foo|, ~s|\\"bar\\"|}
  ]
}

response = HTTPoison.request(request)
