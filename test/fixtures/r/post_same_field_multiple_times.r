require(httr)

headers = c(
  `Content-Type` = 'application/x-www-form-urlencoded'
)

data = list(
  `foo` = 'bar',
  `foo` = '',
  `foo` = 'barbar'
)

res <- httr::POST(url = 'http://example.com/', httr::add_headers(.headers=headers), body = data)
