library(httr2)

request("http://localhost:28139/") |>
  req_method("POST") |>
  req_body_form(
    foo = "bar",
    foo = "",
    foo = "barbar"
  ) |>
  req_perform()
