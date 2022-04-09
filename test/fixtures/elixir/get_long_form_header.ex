request = %HTTPoison.Request{
  method: :get,
  url: "http://localhost:28139/api/retail/books/list",
  options: [],
  headers: [
    {~s|Accept|, ~s|application/json|},
    {~s|user-token|, ~s|75d7ce4350c7d6239347bf23d3a3e668|},
  ],
  params: [],
  body: ""
}

response = HTTPoison.request(request)
