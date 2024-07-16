library(httr)

headers = c(
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = list(
  fooo = "blah"
)

res <- httr::PUT(url = "http://localhost:28139/file.txt", httr::add_headers(.headers=headers), body = data, encode = "form")
