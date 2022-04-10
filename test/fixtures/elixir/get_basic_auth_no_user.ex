request = %HTTPoison.Request{
  method: :get,
  url: "http://localhost:28139/",
  options: [hackney: [basic_auth: {"", ~s|some_password|}]],
  headers: [],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
