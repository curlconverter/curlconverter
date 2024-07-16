library(httr2)

request("http://localhost:28139") |>
  req_auth_bearer_token("AAAAAAAAAAAA") |>
  req_perform()
