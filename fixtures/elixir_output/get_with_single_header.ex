request = %HTTPoison.Request{
  method: :get,
  url: "http://example.com/",
  options: [],
  headers: [
    {~s|foo|, ~s|bar|},
  ],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
