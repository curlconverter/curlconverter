request = %HTTPoison.Request{
  method: :put,
  url: "http://localhost:5984/test/_security",
  options: [hackney: [basic_auth: {~s|admin|, ~s|123|}]],
  headers: [],
  params: [],
  body: ~s|{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}|
}

response = HTTPoison.request(request)
