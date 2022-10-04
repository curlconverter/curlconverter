response = HTTPoison.post!(
  "http://localhost:28139/american-art/query",
  File.read!("./sample.sparql"),
  [
    {"Content-type", "application/sparql-query"},
    {"Accept", "application/sparql-results+json"}
  ]
)
