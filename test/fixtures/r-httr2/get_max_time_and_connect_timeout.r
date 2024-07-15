library(httr2)

request("http://localhost:28139") |>
  req_timeout(6.72) |>
  req_perform()
