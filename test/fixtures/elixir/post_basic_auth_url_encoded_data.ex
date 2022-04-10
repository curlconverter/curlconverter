request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/api/oauth/token/",
  options: [hackney: [basic_auth: {~s|foo|, ~s|bar|}]],
  headers: [
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded|},
  ],
  params: [],
  body: [
    {~s|grant_type|, ~s|client_credentials|}
  ]
}

response = HTTPoison.request(request)
