library(httr2)

request("http://localhost:28139") |>
  req_method("POST") |>
  req_body_raw(
    "123",
    type = "application/x-www-form-urlencoded"
  ) |>
  req_perform()
