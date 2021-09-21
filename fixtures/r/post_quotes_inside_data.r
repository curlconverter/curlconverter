require(httr)

data = list(
  `field` = 'don\'t you like quotes'
)

res <- httr::POST(url = 'http://google.com', body = data)
