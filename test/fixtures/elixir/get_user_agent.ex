response = HTTPoison.get!(
  "http://localhost:28139/vc/moviesmagic",
  [
    {"x-msisdn", "XXXXXXXXXXXXX"},
    {"user-agent", "Mozilla Android6.1"}
  ],
  [
    params: [
      {"p", "5"},
      {"pub", "testmovie"},
      {"tkn", "817263812"}
    ]
  ]
)
