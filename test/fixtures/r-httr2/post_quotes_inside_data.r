library(httr2)

request("http://localhost:28139") |>
  req_method("POST") |>
  req_body_form(field = "don't you like quotes") |>
  req_perform()
