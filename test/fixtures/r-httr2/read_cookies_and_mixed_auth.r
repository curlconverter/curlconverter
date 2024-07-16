library(httr2)

request("http://localhost:28139") |>
  req_auth_bearer("AAAAAAAAAAAA") |>
  req_perform()
