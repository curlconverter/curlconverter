request = %HTTPoison.Request{
  method: :get,
  url: "http://localhost:28139/synthetics/api/v3/monitors",
  body: "",
  headers: [
    {"X-Api-Key", "123456789"}
  ],
  options: [],
  params: [
    {"test", "2"},
    {"limit", "100"},
    {"w", "4"}
  ]
}

response = HTTPoison.request(request)
