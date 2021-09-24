request = %HTTPoison.Request{
  method: :post,
  url: "http://example.com/",
  options: [],
  headers: [],
  params: [],
  body: [
    {~s|foo|, ~s|\\"bar\\"|}
  ]
}

response = HTTPoison.request(request)
