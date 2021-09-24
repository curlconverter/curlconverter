require(httr)

data = list(
  `foo` = '\\"bar\\"'
)

res <- httr::POST(url = 'http://example.com/', body = data)
