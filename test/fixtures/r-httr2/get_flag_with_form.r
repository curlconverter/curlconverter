library(httr2)

request("http://localhost:28139/upload") |>
  req_method("POST") |>
  req_body_multipart(name = "value") |>
  req_perform()
