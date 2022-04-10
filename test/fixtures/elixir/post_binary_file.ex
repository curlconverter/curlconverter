request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/american-art/query",
  options: [],
  headers: [
    {~s|Content-type|, ~s|application/sparql-query|},
    {~s|Accept|, ~s|application/sparql-results+json|},
  ],
  params: [],
  body: File.read!("./sample.sparql")
}

response = HTTPoison.request(request)
