require(httr)

headers = c(
  `Content-Type` = 'application/json',
  `key` = 'abcdefg'
)

res <- httr::POST(url = 'http://1.2.3.4/endpoint', httr::add_headers(.headers=headers))
