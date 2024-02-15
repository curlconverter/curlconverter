library(httr)

headers = c(
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = '{"title":"china1"}'

res <- httr::POST(url = "http://localhost:28139/post", httr::add_headers(.headers=headers), body = data)
