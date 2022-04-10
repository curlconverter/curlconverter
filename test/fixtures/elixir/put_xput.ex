request = %HTTPoison.Request{
  method: :put,
  url: "http://localhost:28139/twitter/_mapping/user?pretty",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/json|},
  ],
  params: [],
  body: ~s|{"properties": {"email": {"type": "keyword"}}}|
}

response = HTTPoison.request(request)
