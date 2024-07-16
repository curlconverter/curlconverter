library(httr)

headers = c(
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = "item[]=1&item[]=2&item[]=3"

res <- httr::PATCH(url = "http://localhost:28139/patch", httr::add_headers(.headers=headers), body = data)
