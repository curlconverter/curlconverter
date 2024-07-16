library(httr2)

request("http://localhost:28139") |>
  req_url_query(
    foo = "bar",
    baz = "qux"
  ) |>
  req_perform()
