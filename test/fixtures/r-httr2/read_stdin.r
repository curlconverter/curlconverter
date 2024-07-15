library(httr2)

request("http://localhost:28139") |>
  req_method("POST") |>
  req_body_file("-") |>
  req_perform()
