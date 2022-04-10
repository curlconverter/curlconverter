request = %HTTPoison.Request{
  method: :get,
  url: "http://localhost:28139/",
  options: [],
  headers: [
    {~s|foo|, ~s|bar|},
  ],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
