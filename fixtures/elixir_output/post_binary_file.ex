method = :post
url = "http://lodstories.isi.edu:3030/american-art/query"
headers = [
  {~s|Content-type|, ~s|application/sparql-query|},
  {~s|Accept|, ~s|application/sparql-results+json|},
]
body = File.read!("./sample.sparql")
options = []
params = []

request = %HTTPoison.Request{
  method: method,
  url: url,
  body: body,
  headers: headers,
  options: options,
  params: params,
}

response = HTTPoison.request(request)
