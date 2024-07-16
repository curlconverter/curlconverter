library(httr2)

request("http://localhost:28139") |>
  req_method("POST") |>
  req_headers(Accept = "application/json") |>
  req_body_raw(
    '{ "drink": "coffe" }',
    type = "application/json"
  ) |>
  req_perform()
