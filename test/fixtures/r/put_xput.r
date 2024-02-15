library(httr)

headers = c(
  `Content-Type` = "application/json"
)

data = '{"properties": {"email": {"type": "keyword"}}}'

res <- httr::PUT(url = "http://localhost:28139/twitter/_mapping/user?pretty", httr::add_headers(.headers=headers), body = data)
