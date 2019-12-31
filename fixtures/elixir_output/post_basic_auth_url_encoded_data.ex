request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost/api/oauth/token/",
  options: [hackney: [basic_auth: {~s|foo|, ~s|bar|}]],
  headers: [],
  params: [],
  body: [
    {~s|grant_type|, ~s|client_credentials|}
  ]
}

response = HTTPoison.request(request)
