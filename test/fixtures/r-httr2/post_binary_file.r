library(httr2)

headers = c(
  `Accept` = "application/sparql-results+json"
)

request("http://localhost:28139/american-art/query") |> 
  req_method("POST") |> 
  req_headers(!!!headers) |> 
  req_body_file("./sample.sparql") |> 
  req_perform()
