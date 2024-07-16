library(httr2)

request("http://localhost:28139/file.txt") |>
  req_method("PUT") |>
  req_perform()
