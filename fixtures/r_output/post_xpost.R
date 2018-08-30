require(httr)

data = '{"keywords":"php","page":1,"searchMode":1}'

res <- httr::POST(url = 'http://us.jooble.org/api/xxxxxxxxxxxxxxxx', body = data)
