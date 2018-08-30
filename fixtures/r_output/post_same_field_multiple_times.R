require(httr)

data = list(
  `foo` = 'bar',
  `foo` = '',
  `foo` = 'barbar'
)

res <- httr::POST(url = 'http://example.com/', body = data)
