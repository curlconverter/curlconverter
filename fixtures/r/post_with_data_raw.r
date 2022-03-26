require(httr)

headers = c(
  `Content-Type` = 'application/x-www-form-urlencoded'
)

data = list(
  `msg1` = 'wow',
  `msg2` = 'such',
  `msg3` = '@rawmsg'
)

res <- httr::POST(url = 'http://example.com/post', httr::add_headers(.headers=headers), body = data)
