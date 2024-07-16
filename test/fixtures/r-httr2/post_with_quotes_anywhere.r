library(httr2)

request("http://localhost:28139") |>
  req_method("POST") |>
  req_headers(
    A = "''a'",
    B = '"',
    Cookie = "x=1'; y=2\""
  ) |>
  req_body_raw(
    "a=b&c=\"&d='",
    type = "application/x-www-form-urlencoded"
  ) |>
  req_auth_basic("ol'", 'asd"') |>
  req_perform()
