library(httr2)

request("http://localhost:28139/post") |>
  req_method("POST") |>
  req_body_raw(
    '{"title":"china1"}',
    type = "application/x-www-form-urlencoded"
  ) |>
  req_perform()
