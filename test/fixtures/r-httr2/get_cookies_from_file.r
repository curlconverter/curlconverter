library(httr2)

request("http://localhost:28139/") |>
  req_perform()
