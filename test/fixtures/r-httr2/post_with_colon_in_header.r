library(httr2)

request("http://localhost:28139/endpoint") |>
  req_method("POST") |>
  req_headers(key = "abcdefg") |>
  req_perform()
