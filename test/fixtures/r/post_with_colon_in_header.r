library(httr)

headers = c(
  `Content-Type` = "application/json",
  key = "abcdefg"
)

res <- httr::POST(url = "http://localhost:28139/endpoint", httr::add_headers(.headers=headers))
