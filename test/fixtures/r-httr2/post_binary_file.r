library(httr2)

request("http://localhost:28139/american-art/query") |>
  req_method("POST") |>
  req_headers(Accept = "application/sparql-results+json") |>
  req_body_file("./sample.sparql") |>
  req_perform()
