library(httr2)

request("http://localhost:28139") |>
  req_headers(Range = "bytes=600-") |>
  req_perform()
