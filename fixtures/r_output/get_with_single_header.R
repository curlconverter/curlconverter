require(httr)

headers = c(
  `foo` = 'bar'
)

res <- httr::GET(url = 'http://example.com/', httr::add_headers(.headers=headers))
