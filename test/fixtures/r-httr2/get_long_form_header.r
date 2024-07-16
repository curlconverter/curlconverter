library(httr2)

request("http://localhost:28139/api/retail/books/list") |>
  req_headers(
    Accept = "application/json",
    `user-token` = "75d7ce4350c7d6239347bf23d3a3e668"
  ) |>
  req_perform()
