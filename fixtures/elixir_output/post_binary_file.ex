request = %HTTPoison.Request{
  method: :post,
  url: "http://lodstories.isi.edu:3030/american-art/query",
  options: [],
  headers: [
    {~s|Content-type|, ~s|application/sparql-query|},
    {~s|Accept|, ~s|application/sparql-results+json|},
  ],
  params: [],
  body: File.read!("./sample.sparql")
}

response = HTTPoison.request(request)
