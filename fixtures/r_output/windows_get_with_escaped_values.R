require(httr)

data = list(
  `a` = 'b',
  `c` = 'd',
  `e` = 'f',
  `h` = 'i',
  `j` = 'k',
  `l` = 'm'
)

res <- httr::POST(url = 'http://www.url.com/page', body = data)