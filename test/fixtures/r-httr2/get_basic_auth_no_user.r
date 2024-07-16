library(httr2)

request("http://localhost:28139/") |>
  req_auth_basic("", "some_password") |>
  req_perform()
