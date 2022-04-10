request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/api/xxxxxxxxxxxxxxxx",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded|},
  ],
  params: [],
  body: ~s|{"keywords":"php","page":1,"searchMode":1}|
}

response = HTTPoison.request(request)
