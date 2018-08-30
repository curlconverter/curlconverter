require(httr)

files = list(
  `username` = 'davidwalsh',
  `password` = 'something'
)

res <- httr::POST(url = 'http://domain.tld/post-to-me.php', body = files)
