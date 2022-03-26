require(httr)

headers = c(
  `Content-Type` = 'application/x-www-form-urlencoded'
)

data = '{"keywords":"php","page":1,"searchMode":1}'

res <- httr::POST(url = 'http://us.jooble.org/api/xxxxxxxxxxxxxxxx', httr::add_headers(.headers=headers), body = data)
