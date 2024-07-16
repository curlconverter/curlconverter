library(httr)

cookies = c(
  x = "1'",
  y = '2"'
)

headers = c(
  A = "''a'",
  B = '"',
  `Content-Type` = "application/x-www-form-urlencoded"
)

data = "a=b&c=\"&d='"

res <- httr::POST(url = "http://localhost:28139", httr::add_headers(.headers=headers), httr::set_cookies(.cookies = cookies), body = data, httr::authenticate("ol'", 'asd"'))
