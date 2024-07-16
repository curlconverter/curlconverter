library(httr2)

request("http://localhost:28139/CurlToNode") |>
  req_method("POST") |>
  req_headers(Accept = "application/json") |>
  req_body_raw(
    "18233982904",
    type = "application/json"
  ) |>
  req_perform()
