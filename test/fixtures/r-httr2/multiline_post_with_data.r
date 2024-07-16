library(httr2)

request("http://localhost:28139/echo/html/") |>
  req_headers(Origin = "http://fiddle.jshell.net") |>
  req_body_form(
    msg1 = "value1",
    msg2 = "value2"
  ) |>
  req_perform()
