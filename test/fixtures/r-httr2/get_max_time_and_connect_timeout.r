library(httr2)

request("http://localhost:28139") |>
  req_timeout(6.72) |>
  req_options(connecttimeout = 13.9999) |>
  req_perform()
