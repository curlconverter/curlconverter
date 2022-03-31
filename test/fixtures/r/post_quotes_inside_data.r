require(httr)

headers = c(
  `Content-Type` = 'application/x-www-form-urlencoded'
)

data = list(
  `field` = 'don\'t you like quotes'
)

res <- httr::POST(url = 'http://google.com', httr::add_headers(.headers=headers), body = data)
