method = :get
url = "http://localhost:8080/api/retail/books/list"
headers = [
  {~s|Accept|, ~s|application/json|},
  {~s|user-token|, ~s|75d7ce4350c7d6239347bf23d3a3e668|},
]
body = nil
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
