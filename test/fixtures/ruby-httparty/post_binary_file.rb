require 'httparty'

url = 'http://localhost:28139/american-art/query'
headers = {
  'Content-type': 'application/sparql-query',
  'Accept': 'application/sparql-results+json',
}
body = File.binread('./sample.sparql').delete("\n")
res = HTTParty.post(url, headers: headers, body_stream: body)
