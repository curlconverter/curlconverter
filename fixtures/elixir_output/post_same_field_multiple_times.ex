request = %HTTPoison.Request{
  method: :post,
  url: "http://example.com/",
  options: [],
  headers: [],
  params: [],
  body: [
    {~s|foo|, ~s|bar|},
    {~s|foo|, ""},
    {~s|foo|, ~s|barbar|}
  ]
}

response = HTTPoison.request(request)
