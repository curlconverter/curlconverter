request = %HTTPoison.Request{
  method: :put,
  url: "http://localhost:9200/twitter/_mapping/user",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/json|},
  ],
  params: [
    {~s|pretty|, ""},
  ],
  body: ~s|{"properties": {"email": {"type": "keyword"}}}|
}

response = HTTPoison.request(request)
