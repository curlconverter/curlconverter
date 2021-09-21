require(httr)

data = '{"title":"china1"}'

res <- httr::POST(url = 'http://localhost:28139/post', body = data)
