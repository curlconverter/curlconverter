require(httr)

data = list(
  `data` = '1',
  `text` = '%D2%D4'
)

res <- httr::POST(url = 'http://example.com/', body = data)
