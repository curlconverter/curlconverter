library(httr2)

request("http://localhost:28139") |>
  req_options(maxredirs = 20) |>
  req_perform()
