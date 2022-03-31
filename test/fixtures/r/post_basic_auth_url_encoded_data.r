require(httr)

headers = c(
  `Content-Type` = 'application/x-www-form-urlencoded'
)

data = list(
  `grant_type` = 'client_credentials'
)

res <- httr::POST(url = 'http://localhost/api/oauth/token/', httr::add_headers(.headers=headers), body = data, httr::authenticate('foo', 'bar'))
