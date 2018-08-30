require(httr)

data = '{"title":"china1"}'

res <- httr::POST(url = 'http://example.com/post', body = data)
