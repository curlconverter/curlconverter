library(httr)

headers = c(
  `Content-Type` = "application/json",
  Accept = "application/json"
)

data = "{   }"

res <- httr::POST(url = "http://localhost:28139", httr::add_headers(.headers=headers), body = data)
