library(httr2)

request("http://localhost:28139/api/oauth/token/") |>
  req_method("POST") |>
  req_body_form(grant_type = "client_credentials") |>
  req_auth_basic("foo", "bar") |>
  req_perform()
