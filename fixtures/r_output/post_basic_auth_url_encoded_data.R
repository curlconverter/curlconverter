require(httr)

data = list(
  `grant_type` = 'client_credentials'
)

res <- httr::POST(url = 'http://localhost/api/oauth/token/', body = data, httr::authenticate('foo', 'bar'))
