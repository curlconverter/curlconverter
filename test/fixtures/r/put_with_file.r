library(httr)

headers = c(
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = upload_file("new_file")
res <- httr::PUT(url = "http://localhost:28139/upload", httr::add_headers(.headers=headers), body = data)
