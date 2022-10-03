request = %HTTPoison.Request{
  method: :get,
  url: "http://localhost:28139/vc/moviesmagic",
  body: "",
  headers: [
    {"x-msisdn", "XXXXXXXXXXXXX"},
    {"user-agent", "Mozilla Android6.1"}
  ],
  options: [],
  params: [
    {"p", "5"},
    {"pub", "testmovie"},
    {"tkn", "817263812"}
  ]
}

response = HTTPoison.request(request)
