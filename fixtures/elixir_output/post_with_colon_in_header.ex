request = %HTTPoison.Request{
  method: :post,
  url: "http://1.2.3.4/endpoint",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/json|},
    {~s|key|, ~s|abcdefg|},
  ],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
