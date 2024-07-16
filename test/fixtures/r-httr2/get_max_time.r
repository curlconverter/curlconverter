library(httr2)

request("http://localhost:28139") |>
  req_timeout(20) |>
  req_perform()
