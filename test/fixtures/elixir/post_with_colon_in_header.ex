request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/endpoint",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/json|},
    {~s|key|, ~s|abcdefg|},
  ],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
