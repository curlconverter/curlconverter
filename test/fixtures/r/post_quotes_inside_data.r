library(httr)

headers = c(
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = list(
  field = "don't you like quotes"
)

res <- httr::POST(url = "http://localhost:28139", httr::add_headers(.headers=headers), body = data, encode = "form")
