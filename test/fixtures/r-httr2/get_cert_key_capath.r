library(httr2)

request("https://localhost:28139") |>
  req_perform()
