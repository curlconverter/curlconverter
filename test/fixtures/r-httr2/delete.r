library(httr2)

request("http://localhost:28139/page") |>
  req_method("DELETE") |>
  req_perform()
