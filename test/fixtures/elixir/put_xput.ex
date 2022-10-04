response = HTTPoison.put!(
  "http://localhost:28139/twitter/_mapping/user?pretty",
  "{\"properties\": {\"email\": {\"type\": \"keyword\"}}}",
  [
    {"Content-Type", "application/json"}
  ]
)
