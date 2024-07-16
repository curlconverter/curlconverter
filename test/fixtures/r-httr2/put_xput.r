library(httr2)

request("http://localhost:28139/twitter/_mapping/user?pretty") |>
  req_method("PUT") |>
  req_body_raw(
    '{"properties": {"email": {"type": "keyword"}}}',
    type = "application/json"
  ) |>
  req_perform()
