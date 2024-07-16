library(httr2)

request("http://localhost:28139/test/_security") |>
  req_method("PUT") |>
  req_body_raw(
    '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}',
    type = "application/x-www-form-urlencoded"
  ) |>
  req_auth_basic("admin", "123") |>
  req_perform()
