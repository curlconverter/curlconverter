library(httr2)

request("http://localhost:28139") |>
  req_url_query(
    key = "one",
    key = "two"
  ) |>
  req_perform()
