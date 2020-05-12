require(httr)

data = list(
  `msg1` = 'wow',
  `msg2` = 'such',
  `msg3` = '@rawmsg'
)

res <- httr::POST(url = 'http://example.com/post', body = data)
