library(httr2)

request("http://localhost:28139/upload") |>
  req_method("PUT") |>
  req_body_file("new_file") |>
  req_perform()
