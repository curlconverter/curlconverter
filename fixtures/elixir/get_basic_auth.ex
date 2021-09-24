request = %HTTPoison.Request{
  method: :get,
  url: "https://api.test.com/",
  options: [hackney: [basic_auth: {~s|some_username|, ~s|some_password|}]],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
