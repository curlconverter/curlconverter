library(httr2)

request("http://localhost:28139") |>
  req_method("POST") |>
  req_body_raw(
    paste0("foo&@", Sys.getenv("FILENAME")),
    type = "application/x-www-form-urlencoded"
  ) |>
  req_perform()
