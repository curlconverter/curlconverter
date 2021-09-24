require(httr)

headers = c(
  `Content-Type` = 'application/json'
)

params = list(
  `pretty` = ''
)

data = '{"properties": {"email": {"type": "keyword"}}}'

res <- httr::PUT(url = 'http://localhost:9200/twitter/_mapping/user', httr::add_headers(.headers=headers), query = params, body = data)

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# res <- httr::PUT(url = 'http://localhost:9200/twitter/_mapping/user?pretty', httr::add_headers(.headers=headers), body = data)
