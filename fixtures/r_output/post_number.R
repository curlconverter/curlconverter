require(httr)

data = '123'

res <- httr::POST(url = 'http://a.com/', body = data)
