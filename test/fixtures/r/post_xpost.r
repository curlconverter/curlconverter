library(httr)

headers = c(
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = '{"keywords":"php","page":1,"searchMode":1}'

res <- httr::POST(url = "http://localhost:28139/api/xxxxxxxxxxxxxxxx", httr::add_headers(.headers=headers), body = data)
